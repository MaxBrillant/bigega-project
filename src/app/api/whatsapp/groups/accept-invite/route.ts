// Import necessary types and functions
import { NextRequest, NextResponse } from "next/server";
import fetch from "node-fetch";

const token = process.env.WHAPI_TOKEN;
export async function POST(request: NextRequest) {
  // Parse the request body to get the invite_code
  const inviteCode: string = await request
    .json()
    .then((data) => data.invite_code);

  const options = {
    method: "PUT",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ invite_code: inviteCode }),
  };

  const groupId = await fetch("https://gate.whapi.cloud/groups", options)
    .then((response) =>
      response.json().then((data: any) => {
        if (data.error) {
          throw new Error(
            "Error trying to join the group, check if the group link is written correctly"
          );
        }
        return data.group_id;
      })
    )
    .catch((err) => {
      throw new Error(err);
    });

  return new NextResponse(
    JSON.stringify({
      groupId: groupId,
    })
  );
}
