#include <ArduinoJson.h>

const int JUMP_PIN = 4;
const int DASH_PIN = 5;
const int SPEED_BOOST_PIN = 6;
const int POT_PIN = 9;
const int YELLOW_LED = 16;
const int GREEN_LED = 15;
const int CRASH_LED = 8;
const int DASH_LED = 18;
const int BUZZER_PIN = 17;
const int BUTTON_PIN = 2;
const int SETTINGS_BUTTON_PIN = 42;  // NEW: Settings button

int threshold = 30000;

// Non-blocking LED flash state
bool isFlashing = false;
int flashCount = 0;
unsigned long flashStartTime = 0;
const unsigned long FLASH_ON_TIME = 150;   // 150ms on
const unsigned long FLASH_OFF_TIME = 150;  // 150ms off
const int TOTAL_FLASHES = 3;

// Potentiometer smoothing
const int POT_SAMPLES = 10;
int potReadings[POT_SAMPLES];
int potIndex = 0;

void setup() {
  Serial.begin(115200);
  
  pinMode(YELLOW_LED, OUTPUT);
  pinMode(GREEN_LED, OUTPUT);
  pinMode(CRASH_LED, OUTPUT);
  pinMode(DASH_LED, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(SETTINGS_BUTTON_PIN, INPUT_PULLUP);  // NEW: Settings button

  digitalWrite(YELLOW_LED, LOW);
  digitalWrite(GREEN_LED, LOW);
  digitalWrite(CRASH_LED, LOW);
  digitalWrite(DASH_LED, LOW);
  digitalWrite(BUZZER_PIN, LOW);
  
  // Initialize potentiometer buffer
  for (int i = 0; i < POT_SAMPLES; i++) {
    potReadings[i] = 0;
  }
}

// Get smoothed potentiometer value
int getPotValue() {
  potReadings[potIndex] = analogRead(POT_PIN);
  potIndex = (potIndex + 1) % POT_SAMPLES;
  
  int sum = 0;
  for (int i = 0; i < POT_SAMPLES; i++) {
    sum += potReadings[i];
  }
  return sum / POT_SAMPLES;
}

void updateFlashing() {
  if (!isFlashing) return;

  unsigned long elapsedTime = millis() - flashStartTime;
  unsigned long cycleDuration = FLASH_ON_TIME + FLASH_OFF_TIME;
  unsigned long totalDuration = cycleDuration * TOTAL_FLASHES;

  if (elapsedTime >= totalDuration) {
    isFlashing = false;
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(YELLOW_LED, LOW);
    digitalWrite(CRASH_LED, LOW);
    digitalWrite(DASH_LED, LOW);
    return;
  }

  unsigned long timeInCycle = elapsedTime % cycleDuration;
  bool shouldBeOn = (timeInCycle < FLASH_ON_TIME);

  if (shouldBeOn) {
    digitalWrite(GREEN_LED, HIGH);
    digitalWrite(YELLOW_LED, HIGH);
    digitalWrite(CRASH_LED, HIGH);
    digitalWrite(DASH_LED, HIGH);
  } else {
    digitalWrite(GREEN_LED, LOW);
    digitalWrite(YELLOW_LED, LOW);
    digitalWrite(CRASH_LED, LOW);
    digitalWrite(DASH_LED, LOW);
  }
}

void loop() {
  updateFlashing();

  int jumpTouch = touchRead(JUMP_PIN);
  int dashTouch = touchRead(DASH_PIN);
  int speedBoostTouch = touchRead(SPEED_BOOST_PIN);
  int potValue = getPotValue();
  int buttonState = digitalRead(BUTTON_PIN);
  int settingsButtonState = digitalRead(SETTINGS_BUTTON_PIN);  // NEW: Read GPIO42

  bool isJumping = (jumpTouch > threshold);
  bool isDashing = (dashTouch > threshold);
  bool isSpeedBoost = (speedBoostTouch > threshold);
  bool buttonPressed = (buttonState == LOW);
  bool settingsPressed = (settingsButtonState == LOW);  // NEW: Check if pressed

  if (!isFlashing && isDashing) {
    digitalWrite(DASH_LED, HIGH);
  } else if (!isFlashing) {
    digitalWrite(DASH_LED, LOW);
  }

  StaticJsonDocument<200> doc;
  doc["jump"] = isJumping;
  doc["dash"] = isDashing;
  doc["speedBoost"] = isSpeedBoost;
  doc["pot"] = potValue;
  doc["button"] = buttonPressed;
  doc["settings"] = settingsPressed;  // NEW: Add settings button to JSON

  serializeJson(doc, Serial);
  Serial.println();

  if (Serial.available() > 0) {
    String command = Serial.readStringUntil('\n');
    command.trim();

    if (command == "CRASH") {
      digitalWrite(YELLOW_LED, HIGH);
      digitalWrite(CRASH_LED, HIGH);
      digitalWrite(BUZZER_PIN, HIGH);
      delay(300);
      digitalWrite(BUZZER_PIN, LOW);
      delay(100);
      digitalWrite(BUZZER_PIN, HIGH);
      delay(300);
      digitalWrite(BUZZER_PIN, LOW);
      digitalWrite(YELLOW_LED, LOW);
      digitalWrite(CRASH_LED, LOW);
    }
    
    if (command == "SCORE") {
      digitalWrite(GREEN_LED, HIGH);
      digitalWrite(BUZZER_PIN, HIGH);
      delay(100);
      digitalWrite(BUZZER_PIN, LOW);
      digitalWrite(GREEN_LED, LOW);
    }

    if (command == "BUZZ") {
      digitalWrite(BUZZER_PIN, HIGH);
      delay(50);
      digitalWrite(BUZZER_PIN, LOW);
    }

    if (command == "LEVELUP") {
      digitalWrite(GREEN_LED, HIGH);
      delay(200);
      digitalWrite(GREEN_LED, LOW);
      delay(100);
      
      digitalWrite(YELLOW_LED, HIGH);
      delay(200);
      digitalWrite(YELLOW_LED, LOW);
      delay(100);
      
      digitalWrite(CRASH_LED, HIGH);
      delay(200);
      digitalWrite(CRASH_LED, LOW);
    }

    if (command == "ALLFLASH") {
      isFlashing = true;
      flashStartTime = millis();
    }
  }

  delay(50);
}