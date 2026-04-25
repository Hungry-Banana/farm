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
        title: "Data Centers",
        icon: Icons.KubernetesIcon,
        items: [
          {
            title: "Overview",
            url: "/datacenters/overview",
          },
          {
            title: "Data Center Management",
            url: "/datacenters",
          },
        ],
      },
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
          {
            title: "Clusters",
            icon: Icons.DefaultServerIcon,
            items: [
              {
                title: "Overview",
                url: "/clusters/overview",
              },
              {
                title: "Cluster Management",
                url: "/clusters",
              },
            ],
          },
        ],
      },
      {
        title: "Networking",
        icon: Icons.NetworkingDeviceIcon,
        items: [
          {
            title: "Switches",
            icon: Icons.SwitchIcon,
            items: [
              {
                title: "Switch Management",
                url: "/networking/switches",
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
