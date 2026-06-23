import { getCoupon, redeemCoupon } from "../services/services";

export async function couponLoader({ params }) {
    const couponId = params.couponId;
    const couponData = await getCoupon(couponId);
    return { couponData };
}

export async function couponAction({ request }) {
    const formData = await request.formData();
    const couponId = formData.get("couponId");
    const couponData = await redeemCoupon(couponId);
    return { couponData };
}
