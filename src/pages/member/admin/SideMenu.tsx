import React, { JSX, useState } from 'react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Collapse
} from '@mui/material';
import {
  Send as SendIcon,
  Drafts as DraftsIcon,
  MoveToInbox as InboxIcon,
  ExpandLess,
  ExpandMore,
  StarBorder,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  Label as LabelIcon,
  Home as HomeIcon,
  Settings as SettingsIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Dashboard as DashboardIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

type IconComponent = React.ComponentType<any>;

interface BaseMenuItem {
  id: string;
  text: string;
  icon: keyof typeof iconMap;
}

interface NavigateMenuItem extends BaseMenuItem {
  action: "navigate";
  path: string;
}

interface ExpandMenuItem extends BaseMenuItem {
  action: "expand";
  expandable: true;
  defaultOpen?: boolean;
  subItems: MenuItem[];
}

interface CustomMenuItem extends BaseMenuItem {
  action: "custom";
  customHandler: () => void;
}

export type MenuItem = NavigateMenuItem | ExpandMenuItem | CustomMenuItem;

export interface MenuConfig {
  title: string;
  items: MenuItem[];
}

interface ExpandedState {
  [key: string]: boolean;
}

// Icon mapping with MUI icons
const iconMap: Record<string, IconComponent> = {
  Send: SendIcon,
  Drafts: DraftsIcon,
  Inbox: InboxIcon,
  StarBorder: StarBorder,
  Archive: ArchiveIcon,
  Delete: DeleteIcon,
  Label: LabelIcon,
  Home: HomeIcon,
  Settings: SettingsIcon,
  Person: PersonIcon,
  Business: BusinessIcon,
  Assessment: AssessmentIcon,
  Dashboard: DashboardIcon,
  Notifications: NotificationsIcon,
  Security: SecurityIcon
} as const;

export interface SideMenuProps {
  config: MenuConfig;
  onNavigate?: (path: string) => void;
  width?: number;
}

function SideMenu({ 
  config, 
  onNavigate,
  width = 360 
}: SideMenuProps): JSX.Element {
  const [expandedItems, setExpandedItems] = useState<ExpandedState>(() => {
    const defaultExpanded: ExpandedState = {};
    config.items.forEach((item: MenuItem) => {
      if (item.action === "expand" && item.defaultOpen) {
        defaultExpanded[item.id] = true;
      }
    });
    return defaultExpanded;
  });

  const handleAction = (item: MenuItem): void => {
    switch (item.action) {
      case "navigate":
        if (onNavigate) {
          onNavigate(item.path);
        }
        break;
      case "expand":
        setExpandedItems(prev => ({
          ...prev,
          [item.id]: !prev[item.id]
        }));
        break;
      case "custom":
        item.customHandler();
        break;
    }
  };

  const isExpandableItem = (item: MenuItem): item is ExpandMenuItem => {
    return item.action === "expand";
  };

  const renderMenuItem = (item: MenuItem, level: number = 0): JSX.Element => {
    const IconComponent = iconMap[item.icon];
    const isExpanded = expandedItems[item.id] || false;
    const paddingLeft = level * 2;
    
    return (
      <React.Fragment key={item.id}>
        <ListItemButton 
          onClick={() => handleAction(item)}
          sx={{ pl: paddingLeft + 2 }}
        >
          <ListItemIcon>
            <IconComponent />
          </ListItemIcon>
          <ListItemText primary={item.text} />
          {isExpandableItem(item) && (
            isExpanded ? <ExpandLess /> : <ExpandMore />
          )}
        </ListItemButton>
        
        {isExpandableItem(item) && item.subItems && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              {item.subItems.map((subItem: MenuItem) => 
                renderMenuItem(subItem, level + 1)
              )}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  return (
    <List
      sx={{ 
        width: '100%', 
        maxWidth: width, 
        bgcolor: 'background.paper' 
      }}
      component="nav"
      aria-labelledby="nested-list-subheader"
      subheader={
        <ListSubheader component="div" id="nested-list-subheader">
          {config.title}
        </ListSubheader>
      }
    >
      {config.items.map((item: MenuItem) => renderMenuItem(item))}
    </List>
  );
}

export default SideMenu;