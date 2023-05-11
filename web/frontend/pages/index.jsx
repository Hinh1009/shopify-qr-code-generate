import {
  Page,
  Layout,
  SkeletonBodyText,
  EmptyState,
  AlphaCard
} from "@shopify/polaris";
import { TitleBar, useNavigate, Loading } from "@shopify/app-bridge-react";
import { QRCodeIndex } from "../components";
import { useAppQuery } from "../hooks";

export default function HomePage() {

  /* useAppQuery wraps react-query and the App Bridge authenticatedFetch function */
  const {
    data: QRCodes,
    isLoading,

    /*
      react-query provides stale-while-revalidate caching.
      By passing isRefetching to Index Tables we can show stale data and a loading state.
      Once the query refetches, IndexTable updates and the loading state is removed.
      This ensures a performant UX.
    */
    isRefetching,
  } = useAppQuery({
    url: "/api/qrcodes",
  });

  const navigate = useNavigate()
  const qrCodesMarkup = QRCodes?.length ? (
    < QRCodeIndex QRCodes={QRCodes} loading={isRefetching} />
  ) : null
  // const [loading, setLoading] = useState(true)

  const loadingMarkup = isLoading ? (
    <AlphaCard sectioned>
      <Loading />
      <SkeletonBodyText />
    </AlphaCard>
  ) : null

  const emptyStateMarkup = !isLoading && !QRCodes?.length ? (
    <AlphaCard sectioned>
      <EmptyState
        heading="Create unique QR codes for your product"
        action={{
          content: "Create QR code",
          onAction: () => navigate("/qrcodes/new"),
        }}
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
      >
        <p>
          Allow customers to scan codes and buy products using their phones.
        </p>
      </EmptyState>
    </AlphaCard>
  ) : null

  return (
    <Page fullWidth={!!qrCodesMarkup}>
      <TitleBar title="QR Generate App" primaryAction={{
        content: 'Create QR Code',
        onAction: () => navigate('/qrcodes/new')
      }} />
      <Layout>
        <Layout.Section>
          {loadingMarkup}
          {qrCodesMarkup}
          {emptyStateMarkup}
        </Layout.Section>
      </Layout>
    </Page>
  );
}
