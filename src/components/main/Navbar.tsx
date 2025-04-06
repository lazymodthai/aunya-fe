import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu } from 'antd'
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
    <Menu
      theme="dark"
      mode="horizontal"
      selectedKeys={[getSelectedKey()]}
      items={items}
      style={{ lineHeight: '64px' }}
    />
  );
};

export default Navbar;