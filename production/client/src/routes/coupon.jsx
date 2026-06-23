import {useLoaderData } from "react-router-dom";
import { Form } from "react-router";
import { useState } from "react";

import couponImgSrc from "../assets/images/coupon/couponState.avif" 

export default function Coupon (){
const {couponData} = useLoaderData();
const couponId = couponData.id;
const cafe = couponData.trip.cafe.name;

const couponActive = (couponData.status === 'active');
const [couponState, setCouponState ] = useState(couponActive);

return (
    <>

 
    
                <div className="coupon-container">
                    <div className="coupon__header">
                        {/* Header space */}
                    </div>
    
                    <img className="coupon__buildings sadImg" src={couponImgSrc} alt="couponImg" />
               
                    <div className="coupon__cta">
                <div>
                    <p className={couponState? "coupon__active": "coupon__used"}>status:{couponState? " active": " used"}</p>
                </div>
                        <h3 className="title">1 drink at <br/> {cafe}</h3>
                        <p className="text coupon__cta-text">
                    Upon redemption, this person gets one free drink at your establishment.
                        </p>
                <Form method="post">
                    <button onClick={()=>setCouponState(false)} type="submit" disabled={!couponState}>redeem coupon</button>
                    <input type="hidden" name="couponId" value={couponId} />
                </Form>
                    </div>
                </div>
         
    </>
)
    
}