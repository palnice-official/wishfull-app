import { json } from "@remix-run/node";
import db  from "../db.server";
import { cors } from "remix-utils/cors";

export async function loader({ request }) {
  const url = new URL(request.url);
  const customerId = url.searchParams.get("customerId");
  const shop = url.searchParams.get("shop");
  const prductId = url.searchParams.get("productId");

  if (!customerId || !shop || !prductId) {
    return json({
      message: "Missing required parameters: customerId, shop, or productId",
      method: "GET",
    });
  }

  const wishlist = await db.wishlist.findMany({
    where: {
      customerId: customerId,
      shop: shop,
      productId: prductId,
    },
  });

  const response = {
    message: "Wishlist retrieved successfully",
    ok: true,
    data: wishlist,
  };
  return cors(request, json(response), {
    origin: "https://palnice.myshopify.com",
    methods: ["GET"],
    headers: ["Content-Type"],
  });
}

export async function action({ request }) {
  let data = await request.formData();
  data = Object.fromEntries(data);
  const customerId = data.customerId;
  const shop = data.shop;
  const productId = data.productId;
  const _action = data._action;
  if (!customerId || !shop || !productId) {
    return json({
      message: "Missing required parameters: customerId, shop, or productId",
      method: _action,
    });
  }

  let response;
  switch (_action) {
    case "CREATE":
      const wishlist = await db.wishlist.create({
        data: {
          customerId,
          shop,
          productId,
        },
      });
      response = json({
        message: "Wishlist created successfully",
        method: _action,
        wishlisted: true,
      });

      return cors(request, response, {
        origin: "https://palnice.myshopify.com",
        methods: ["POST"],
        headers: ["Content-Type"],
      });

      case "PATCH":
    return json({message: "Success", method: "Patch"});

    case "DELETE": 
    await db.wishlist.deleteMany({
        where: {
            customerId: customerId,
            shop: shop,
            productId: productId
        }
    })
    response = json({
        message: "Product removed from your wishlist",
        method: _action,
        wishlisted: false,
      });
      return cors(request, response, {
        origin: "https://palnice.myshopify.com",
        methods: ["POST"],
        headers: ["Content-Type"],
      });

      default:
        return new Response("Method Not Allowed", {status:405})
  }



}
