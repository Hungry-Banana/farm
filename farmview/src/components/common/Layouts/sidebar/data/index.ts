import * as Icons from "@/assets/icons";

export const NAV_DATA = [
  {
    label: "OVERVIEW",
    items: [
      {
        title: "Dashboards",
        icon: Icons.DashBoardIcon,
        items: [
          {
            title: "Main Dashboard",
            url: "/",
          },
        ],
      }
    ],
  },
  {
    label: "MANAGEMENT",
    items: [
      {
        title: "Servers",
        icon: Icons.DefaultServerIcon,
        items: [
          {
            title: "Overview",
            url: "/servers/overview",
          },
          {
            title: "Server Management",
            url: "/servers",
          },
          {
            title: "Components",
            url: "/servers/components",
          },
          {
            title: "Virtual Machines",
            icon: Icons.DefaultServerIcon,
            items: [
              {
                title: "Overview",
                url: "/servers/vms/overview",
              },
              {
                title: "VM Management",
                url: "/servers/vms",
              },
            ],
          },
        ],
      },
      {
        title: "Kubernetes",
        icon: Icons.KubernetesIcon,
        items: [
          {
            title: "Overview",
            url: "/kubernetes/overview",
          },
          {
            title: "Cluster Management",
            url: "/kubernetes",
          },
        ],
      },
    ],
  },
  {
    label: "SYSTEM",
    items: [
      {
        title: "Settings",
        icon: Icons.SettingsIcon,
        url: "/settings",
      },
    ],
  },
];
