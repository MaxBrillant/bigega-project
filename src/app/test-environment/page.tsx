export default function Main() {
  return (
    <div className="w-fit h-fit space-y-5 p-5 m-auto drop-shadow-2xl">
      <p>Please don't pay as it is intended for testing</p>
      <form
        action="https://www.afripay.africa/checkout/index.php"
        method="post"
        id="afripayform"
      >
        <input type="hidden" name="amount" value="5" />
        <input type="hidden" name="currency" value="USD" />
        <input type="hidden" name="comment" value="Order 122" />
        <input type="hidden" name="client_token" value="12345" />
        <input type="hidden" name="return_url" value="https://www.bigega.com" />
        <input
          type="hidden"
          name="app_id"
          value={process.env.AFRIPAY_APP_ID as string}
        />
        <input
          type="hidden"
          name="app_secret"
          value={process.env.AFRIPAY_APP_SECRET as string}
        />
        <button type="submit">
          <input
            type="image"
            src="https://www.afripay.africa/logos/pay_with_afripay.png"
            alt="Pay
with AfriPay"
          />
        </button>
      </form>
    </div>
  );
}
