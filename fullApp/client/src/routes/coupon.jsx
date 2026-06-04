import { getCoupon,redeemCoupon } from "../services/services";
import { useLoaderData} from "react-router-dom";
import { Form } from "react-router";

export async function couponLoader({params}){
const couponId = params.couponId;
const couponData = await getCoupon(couponId);

return {couponData}
}

export async function couponAction({ request }) {
    const formData = await request.formData();
    const couponId = formData.get("couponId");
    const couponData = await redeemCoupon(couponId);

    return { couponData }
}

export default function Coupon (){
const {couponData} = useLoaderData();
const couponId = couponData.id;
const cafe = couponData.trip.cafe.name;

const couponActive = (couponData.status === 'active');
console.log(couponData);

return (
    <>
    {couponActive && (
        <>
             <h2>your freedrink at {cafe}</h2>
            <p>active</p>
            <Form method="post">
            <button type="submit">redeem coupon</button>
            <input type="hidden" name="couponId" value={couponId} />
            </Form>
            </>
    )}
        {!couponActive && (
            <>
                <p>This coupon has already been used...</p>
               
            </>
        )}


    
    </>
)
    
}