import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Image, Menu } from 'antd'
import { HomeOutlined, InfoCircleOutlined, PhoneOutlined } from '@ant-design/icons'

const Navbar = () => {
  const location = useLocation();
  
  // กำหนด key ให้ตรงกับพาธที่ใช้ใน route
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/about') return 'about';
    if (path === '/contact') return 'contact';
    return 'home';
  };

  const items = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/">หน้าหลัก</Link>,
    },
    {
      key: 'about',
      icon: <InfoCircleOutlined />,
      label: <Link to="/about">เกี่ยวกับเรา</Link>,
    },
    {
      key: 'contact',
      icon: <PhoneOutlined />,
      label: <Link to="/contact">ติดต่อเรา</Link>,
    },
  ];

  return (
    <>
      <div
        style={{
          // background: "black",
          position: "absolute",
          top: 0,
          left: 0,
          width: 200,
          height: 64,
          color: '#3EC6E0',
          fontSize: '1rem'
        }}
      >
        Aunya Pool Villa
      </div>
      <Menu
        theme="light"
        mode="horizontal"
        selectedKeys={[getSelectedKey()]}
        items={items}
        style={{ lineHeight: "64px", background: "#F6E7D3", paddingLeft: 200 }}
      />
    </>
  );
};

export default Navbar;