import { Layout } from 'antd'
import { Content } from 'antd/lib/layout/layout'
import { BrandUpdateBanner } from 'components/Navbar/BrandUpdateBanner'
import SiteNavigation from 'components/Navbar/SiteNavigation'
import { ArcxProvider } from 'contexts/Arcx/ArcxProvider'
import { EtherPriceProvider } from 'contexts/EtherPrice/EtherPriceProvider'
import LanguageProvider from 'contexts/Language/LanguageProvider'
import ReactQueryProvider from 'contexts/ReactQueryProvider'
import { ThemeProvider } from 'contexts/Theme/ThemeProvider'
import TxHistoryProvider from 'contexts/Transaction/TxHistoryProvider'
import { useRouter } from 'next/router'
import React from 'react'
import { Provider } from 'react-redux'
import store from 'redux/store'
import { redirectTo } from 'utils/windowUtils'

/**
 * Contains all the core app providers used by each page.
 *
 * This is currently embedded on each page individually. This decision was made
 * as the current language provider doesn't support pre-rendering. Pre-rendering
 * is still an issue, but the current structure allows opengraph and twitter
 * meta tags to be setup correctly.
 */
export const AppWrapper: React.FC = ({ children }) => {
  return (
    <React.StrictMode>
      <ReactQueryProvider>
        <Provider store={store}>
          <LanguageProvider>
            <TxHistoryProvider>
              <ThemeProvider>
                <EtherPriceProvider>
                  <ArcxProvider>
                    <_Wrapper>{children}</_Wrapper>
                  </ArcxProvider>
                </EtherPriceProvider>
              </ThemeProvider>
            </TxHistoryProvider>
          </LanguageProvider>
        </Provider>
      </ReactQueryProvider>
    </React.StrictMode>
  )
}

const _Wrapper: React.FC = ({ children }) => {
  const router = useRouter()
  if (router.asPath.match(/^\/#\//)) {
    redirectTo(router.asPath.replace('/#/', ''))
  }

  return (
    <Layout className="flex h-screen flex-col bg-transparent">
      <BrandUpdateBanner />
      <SiteNavigation />
      <Content className="pt-16 md:p-0">{children}</Content>
    </Layout>
  )
}
