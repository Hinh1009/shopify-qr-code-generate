import { useNavigate } from "@shopify/app-bridge-react";
import { AlphaCard, Icon, IndexTable, VerticalStack, Text, Thumbnail, UnstyledLink } from "@shopify/polaris";
import { DiamondAlertMajor, ImageMajor } from '@shopify/polaris-icons'

/* useMedia supp for display multiple screen size */
import { useMedia } from "@shopify/react-hooks";

/* dayjs to format and display date */
import dayjs from "dayjs";

function SmallScreenCard({ _id, title, product, discountCode, __v, createdAt, navigate }) {
  return (
    <UnstyledLink
      onClick={() => navigate(`qrcodes/${_id}`)}
    >
      <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid #E1E3E5" }}>
        <VerticalStack vertical={true}>
          <Thumbnail
            source={product?.images?.edges?.[0]?.node || ImageMajor}
            alt="placeholder"
            color='base'
            size="small"
          />
          <VerticalStack vertical={true}>
            <p>
              <Text as="span" fontWeight="semibold">
                {truncate(title, 35)}
              </Text>
            </p>
            <p>{truncate(product?.title, 35)}</p>
            <p>{dayjs(createdAt).format("MMMM D, YYYY")}</p>
            <div style={{ display: 'flex' }}>
              <div style={{ flex: '3' }}>
                <Text as="span" color="subdued">Discount</Text>
                <p>{discountCode || "-"}</p>
              </div>
              <div style={{ flex: '2' }}>
                <Text as="span" color="subdued">Scans</Text>
                <p>{__v}</p>
              </div>
            </div>
          </VerticalStack>
        </VerticalStack>
      </div>
    </UnstyledLink>
  )
}
export function QRCodeIndex({ QRCodes, loading }) {
  const navigate = useNavigate()

  const isSmallScreen = useMedia('(max-width: 640px)')

  const resourceName = {
    singular: 'QR code',
    plural: 'QR codes'
  }

  const rowMarkup = QRCodes.map(
    ( QRCode, index) => {
      const product = QRCode.product
      const discountCode = QRCode.discountCode
      const createdAt = QRCode.createdAt

      const deletedProduct = product?.title?.includes('Deleted product')
      
      const QRCodeDocs = QRCode._doc
      const _id = QRCodeDocs._id
      const title = QRCodeDocs.title
      const __v = QRCodeDocs.__v

      return (
        <IndexTable.Row
          id={_id}
          key={_id}
          position={index}
          onClick={() => {
            navigate(`/qrcodes/${_id}`)
          }}
        >
          <IndexTable.Cell>
            <Thumbnail
              source={product?.images?.edges?.[0]?.node?.url || ImageMajor}
              alt="placeholder"
              color="base"
              size="small"
            />
          </IndexTable.Cell>
          <IndexTable.Cell>
            <UnstyledLink data-primary-link url={`/qrcodes/${_id}`}>
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
          <IndexTable.Cell>{__v}</IndexTable.Cell>
        </IndexTable.Row>
      )
    }
  )
  console.log('QRCODES DATA', QRCodes)
  /* small screen */
  return (
    <AlphaCard>
      {/* Map QR codes for small screen */}
      {isSmallScreen ? QRCodes.map((QRCode) => (
        <SmallScreenCard key={QRCode._doc._id} navigate={navigate} {...QRCode} />
      ))
        : (
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
  return str?.length > n ? str.substr(0, n - 1) + "…" : (str || '');
}