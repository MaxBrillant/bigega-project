import { Button } from "@/components/ui/button";
import { getEnvironmentVariables } from "@/utils/supabase/getEnvironmentVariables";
import { useEffect, useState } from "react";

type propsType = {
  donationId: number;
  amount: number;
  currency: "BIF" | "RWF" | "USD" | "KSH";
  label: string;
};
export default function AfripayButton(props: propsType) {
  const [appId, setAppId] = useState<string | undefined>();
  const [appSecret, setAppSecret] = useState<string | undefined>();
  useEffect(() => {
    const getCredentials = async () => {
      const id = (await getEnvironmentVariables("AFRIPAY_APP_ID")) as string;
      setAppId(id);
      const secret = (await getEnvironmentVariables(
        "AFRIPAY_APP_SECRET"
      )) as string;
      setAppSecret(secret);
    };
    getCredentials();
  }, []);
  return (
    appId &&
    appSecret && (
      <form
        action="https://www.afripay.africa/checkout/index.php"
        method="post"
        id="afripayform"
      >
        <input type="hidden" name="amount" value={props.amount} />
        <input type="hidden" name="currency" value={props.currency} />
        <input type="hidden" name="comment" value="Donation" />
        <input type="hidden" name="client_token" value={props.donationId} />
        <input
          type="hidden"
          name="return_url"
          value={`${location.href}?donation=${props.donationId}&method=${
            props.currency === "KSH" ? "mpesa" : "card"
          }&amount=${props.amount}`}
        />
        <input type="hidden" name="app_id" value={appId} />
        <input type="hidden" name="app_secret" value={appSecret} />
        <Button type="submit">{props.label}</Button>
      </form>
    )
  );
}
