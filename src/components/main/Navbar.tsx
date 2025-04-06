import { Menu } from 'antd'

const menuItems = [
  {key: "room", label: "ห้อง"},
  {key: "contact", label: "ติดต่อ"},
]

function Navbar() {
  return (
    <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['2']}
          items={menuItems}
          style={{ flex: 1, minWidth: 0, width: '100vw' }}
        />
  )
}

export default Navbar