import { TitleBar, Loading } from "@shopify/app-bridge-react";
import { LegacyCard, Layout, Page, SkeletonBodyText } from "@shopify/polaris";
import { QRCodeForm } from "../../components";
import { useParams } from "react-router-dom";
import { useAppQuery } from "../../hooks";

export default function QRCodeEdit() {
  const breadcrumbs = [{ content: 'QR Codes', url: '/' }]
  const { id } = useParams()
  /* Mock values. Loading: false => preview page without loading markup */
  // const isLoading = false;
  // const isRefetching = false;

  const {data: QRCode, isLoading, isRefetching} = useAppQuery({
    url: `/api/qrcodes/${id}`,
    reactQueryOptions: {
      /* Disable refetching because the QRCodeForm component ignores changes to its props */
      refetchOnReconnect: false,
    }
  })

  return (
    <>
      {isLoading || isRefetching ?
        <Page>
          <TitleBar
            title="Edit QR Code"
            breadcrumbs={breadcrumbs}
            primaryAction={null}
          />
          <Loading />
          <Layout>
            <Layout.Section>
              <LegacyCard sectioned title='Title' vertical={true}>
                <SkeletonBodyText />
              </LegacyCard>
              <LegacyCard title="Product" vertical={true}>
                <LegacyCard.Section>
                  <SkeletonBodyText lines={1} />
                </LegacyCard.Section>
                <LegacyCard.Section>
                  <SkeletonBodyText lines={3} />
                </LegacyCard.Section>
              </LegacyCard>
              <LegacyCard sectioned title="Discount" vertical={true}>
                <SkeletonBodyText lines={2} />
              </LegacyCard>
            </Layout.Section>
            <Layout.Section secondary>
              <LegacyCard sectioned title="QR code" vertical={true}/>
            </Layout.Section>
          </Layout>
        </Page>
        :
        <Page>
          <TitleBar
            title="Edit QR code"
            breadcrumbs={breadcrumbs}
            primaryAction={null}
          />
          <QRCodeForm QRCode={QRCode} />
        </Page>
      }
    </>
  )

}