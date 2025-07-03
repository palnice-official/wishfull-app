import {
  Page,
  Badge,
  BlockStack,
  Layout,
  Card,
  Text,
  DataTable,
  Button,
} from "@shopify/polaris";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { formatDistanceToNow, parseISO } from "date-fns";

export async function loader({ request }) {
  const auth = await authenticate.admin(request);
  const shop = auth.session.shop;
  console.log("shop------->>>", shop);
  if (!shop) {
    return json({ error: "No shop found" }, { status: 400 });
  }
  const wishfullData = await db.wishlist.findMany({
    where: {
      shop: shop,
    },
    orderBy: {
      id: "asc",
    },
  });

  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
  query {
    customer(id: "gid://shopify/Customer/8688458858779") {
      id
      firstName
      lastName
    }
  }`,
  );

  const data = await response.json();
  console.log("graphQL ===>>",data);


  // console.log("wishlist data ------> >", wishfullData);
  return json(wishfullData);
}

export default function Index() {
  const wishlistData = useLoaderData();
  const wishlistArray = wishlistData.map((item) => {
    const createdAt = formatDistanceToNow(parseISO(item.createdAt), {
      addSuffix: true,
    });
    return [item.customerId, item.productId, createdAt];
  });

  return (
    <Page
      backAction={{ content: "Products", url: "#" }}
      title="Wishfull App Dashboard"
      titleMetadata={<Badge tone="success">Paid</Badge>}
      subtitle="Manage your app settings and view analytics"
      compactTitle
      primaryAction={{ content: "Save", disabled: true }}
      secondaryActions={[
        {
          content: "Duplicate",
          accessibilityLabel: "Secondary action label",
          onAction: () => alert("Duplicate action"),
        },
        {
          content: "View on your store",
          onAction: () => alert("View on your store action"),
        },
      ]}
      actionGroups={[
        {
          title: "Promote",
          actions: [
            {
              content: "Share on Facebook",
              accessibilityLabel: "Individual action label",
              onAction: () => alert("Share on Facebook action"),
            },
          ],
        },
      ]}
      pagination={{
        hasPrevious: true,
        hasNext: true,
      }}
    >
      <ui-title-bar title="Overview">
        <button onclick="console.log('Secondary action')">
          Secondary action 1
        </button>
        <button variant="primary" onclick="console.log('Primary action')">
          Primary action 1
        </button>
      </ui-title-bar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              {wishlistData.length > 0 ? (
                <DataTable
                  columnContentTypes={["text", "text", "text"]}
                  headings={["Customer ID", "Product ID", "Created At"]}
                  rows={wishlistArray}
                />
              ) : (
                <EmptyState
                  heading="Manage your inventory transfers"
                  action={{ content: "Add transfer" }}
                  secondaryAction={{
                    content: "Learn more",
                    url: "https://help.shopify.com",
                  }}
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>
                    Track and receive your incoming inventory from suppliers.
                  </p>
                </EmptyState>
              )}
              <Button
                onClick={() => {
                  window.open(
                    `https://${shop}/admin/themes/current/editor?template=${template}&addAppBlockId=ab7dca42bedd8022dc86b8419b7003b5/customerSupport`,
                  );
                }}
              >
                Click Me
              </Button>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
