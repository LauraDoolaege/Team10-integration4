import { useLoaderData} from "react-router-dom";
import { Form } from "react-router";

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