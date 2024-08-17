import React from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useToast } from "@/components/ui/use-toast";

// Renders errors or successfull transactions on the screen.
function Message(content: any) {
  return <p>{content}</p>;
}

type props = {
  donationId: number;
  method: "card" | "paypal";
  amount: number;
};
function PayPalCheckout(props: props) {
  const { toast } = useToast();

  const initialOptions = {
    clientId:
      "AUggiZwFaqvS1ulLaggk-6nU4fSjMFZzTSR4JmUCZqKGV-QxMicQwwjQ4aSUcaD9yhbmX8SpMxv4jysV",
    "client-id":
      "AUggiZwFaqvS1ulLaggk-6nU4fSjMFZzTSR4JmUCZqKGV-QxMicQwwjQ4aSUcaD9yhbmX8SpMxv4jysV",
    currency: "USD",
    intent: "capture",
    disableFunding: props.method === "paypal" ? "card" : "",
  };

  return (
    <div className="overflow-hidden">
      <div className={props.method === "card" ? "App mt-[-3rem]" : "App"}>
        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtons
            style={{
              shape: "pill",
              layout: "vertical",
              color: "gold",
              label: "paypal",
            }}
            createOrder={async () => {
              try {
                const response = await fetch("/api/payment/paypal/orders", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  // use the "body" param to optionally pass additional order information
                  // like product ids and quantities
                  body: JSON.stringify({
                    cart: [
                      {
                        id: "Donation ID: " + props.donationId,
                        quantity: "1",
                      },
                    ],
                    amount: props.amount,
                  }),
                });

                const orderData = await response.json();

                if (orderData.id) {
                  return orderData.id;
                } else {
                  const errorDetail = orderData?.details?.[0];
                  const errorMessage = errorDetail
                    ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                    : JSON.stringify(orderData);

                  toast({
                    variant: "destructive",
                    title: "Error!",
                    duration: 3000,
                  });
                  throw new Error(errorMessage);
                }
              } catch (error) {
                console.error(error);
                console.log(`Could not initiate PayPal Checkout...${error}`);
                toast({
                  variant: "destructive",
                  title: "Error!",
                  duration: 3000,
                });
              }
            }}
            onApprove={async (data: any, actions: any) => {
              try {
                const response = await fetch(
                  `/api/payment/paypal/orders/capture`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      orderID: data.orderID,
                      donationID: props.donationId,
                    }),
                  }
                );

                const orderData = await response.json();
                // Three cases to handle:
                //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                //   (2) Other non-recoverable errors -> Show a failure message
                //   (3) Successful transaction -> Show confirmation or thank you message

                const errorDetail = orderData?.details?.[0];

                if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                  // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                  // recoverable state, per https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
                  return actions.restart();
                } else if (errorDetail) {
                  // (2) Other non-recoverable errors -> Show a failure message
                  toast({
                    variant: "destructive",
                    title: "Error!",
                    duration: 3000,
                  });
                  throw new Error(
                    `${errorDetail.description} (${orderData.debug_id})`
                  );
                } else {
                  // (3) Successful transaction -> Show confirmation or thank you message
                  // Or go to another URL:  actions.redirect('thank_you.html');
                  const transaction =
                    orderData.purchase_units[0].payments.captures[0];
                  console.log(
                    `Transaction ${transaction.status}: ${transaction.id}. See console for all available details`
                  );
                  console.log(
                    "Capture result",
                    orderData,
                    JSON.stringify(orderData, null, 2)
                  );

                  toast({
                    title: "Success!",
                    duration: 1000,
                  });
                }
              } catch (error) {
                console.error(error);
                console.log(
                  `Sorry, your transaction could not be processed...${error}`
                );
                toast({
                  variant: "destructive",
                  title: "Error!",
                  duration: 3000,
                });
              }
            }}
          />
        </PayPalScriptProvider>
      </div>
    </div>
  );
}

export default PayPalCheckout;
