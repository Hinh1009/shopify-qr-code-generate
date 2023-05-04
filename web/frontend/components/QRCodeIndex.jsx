import { useNavigate } from "@shopify/app-bridge-react";
import { AlphaCard, Icon, IndexTable, VerticalStack, Text, Thumbnail, UnstyledLink } from "@shopify/polaris";
import { DiamondAlertMajor, ImageMajor } from '@shopify/polaris-icons'

/* useMedia supp for display multiple screen size */
import { useMedia } from "@shopify/react-hooks";

/* dayjs to format and display date */
import dayjs from "dayjs";

function SmallScreenCard({ id, title, product, discountCode, scans, createdAt, navigate }) {
  return (
    <UnstyledLink onClick={() => navigate(`qrcodes/${id}`)}>
      <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #E1E3E5" }}>
        <VerticalStack>
          <VerticalStack.Item>
            <Thumbnail
              source={product?.images?.edges[0]?.node?.url || ImageMajor}
              alt="placeholder"
              color='base'
              size="small"
            />
          </VerticalStack.Item>
          <VerticalStack.Item fill>
            <VerticalStack vertical={true}>
              <VerticalStack.Item>
                <p>
                  <Text as="span" fontWeight="semibold">
                    {truncate(title, 35)}
                  </Text>
                </p>
                <p>{truncate(product?.title, 35)}</p>
                <p>{dayjs(createdAt).format("MMMM D, YYYY")}</p>
              </VerticalStack.Item>
              <div style={{ display: 'flex' }}>
                <div style={{ flex: '3' }}>
                  <Text as="span" color="subdued">Discount</Text>
                  <p>{discountCode || "-"}</p>
                </div>
                <div style={{ flex: '2' }}>
                  <Text as="span" color="subdued">Scans</Text>
                  <p>{scans}</p>
                </div>
              </div>
            </VerticalStack>
          </VerticalStack.Item>
        </VerticalStack>
      </div>
    </UnstyledLink>
  )
}

export function QRCodeIndex({ QRCodes, loading }) {
  const navigate = useNavigate()

  const isSmallScreen = useMedia('(max-width: 640px)')

  /* Map QR codes for small screen */
  const smallScreenMarkup = QRCodes.map((QRCode) => (
    <SmallScreenCard key={QRCode.id} navigate={navigate} {...QRCode} />
  ))

  const resourceName = {
    singular: 'QR code',
    plural: 'QR codes'
  }

  const rowMarkup = QRCodes.map(
    ({ id, title, product, discountCode, scans, createdAt }, index) => {
      const deletedProduct = product.title.includes('Deleted product')

      return (
        <IndexTable.Row
          id={id}
          key={id}
          position={index}
          onClick={() => {
            navigate(`/qrcodes/${id}`)
          }}
        >
          <IndexTable.Cell>
            <Thumbnail
              source={product?.images?.edges[0]?.node?.url || ImageMajor}
              alt="placeholder"
              color="base"
              size="small"
            />
          </IndexTable.Cell>
          <IndexTable.Cell>
            <UnstyledLink data-primary-link url={`/qrcodes/${id}`}>
              {truncate(title, 25)}
            </UnstyledLink>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <VerticalStack>
              {deletedProduct && (
                <Icon source={DiamondAlertMajor} color="critical" />
              )}
              <Text as="span" color={deletedProduct ? "critical" : null}>
                {truncate(product?.title, 25)}
              </Text>
            </VerticalStack>
          </IndexTable.Cell>
          <IndexTable.Cell>{discountCode}</IndexTable.Cell>
          <IndexTable.Cell>
            {dayjs(createdAt).format("MMMM D, YYYY")}
          </IndexTable.Cell>
          <IndexTable.Cell>{scans}</IndexTable.Cell>
        </IndexTable.Row>
      )
    }
  )

  /* small screen */
  return (
    <AlphaCard>
    {isSmallScreen ? (
      smallScreenMarkup
    ) : (
      <IndexTable
        resourceName={resourceName}
        itemCount={QRCodes.length}
        headings={[
          { title: "Thumbnail", hidden: true },
          { title: "Title" },
          { title: "Product" },
          { title: "Discount" },
          { title: "Date created" },
          { title: "Scans" },
        ]}
        selectable={false}
        loading={loading}
      >
        {rowMarkup}
      </IndexTable>
    )}
  </AlphaCard>
  )
}

/* A function to truncate long strings */
function truncate(str, n) {
  return str.length > n ? str.substr(0, n - 1) + "…" : str;
}