import { useState } from 'react'
import './App.css'
import Layout, { Content, Header } from 'antd/es/layout/layout'
import Navbar from './components/main/navbar'
import Main from './pages/Main'

function App() {
  return (
    <Layout style={{width: '100vw', height: '100vh'}}>
      <Header>
        <Navbar />
      </Header>
      <Content style={{ padding: '48px' }}>
          <Main />
      </Content>
    </Layout>
  )
}

export default App
