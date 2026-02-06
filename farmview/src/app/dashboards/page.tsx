import Breadcrumb from "@/components/common/Breadcrumbs/Breadcrumb";

export default function HomePage() {
  return (
    <div className="grid grid-cols-1 gap-4 w-full">
      <Breadcrumb />
      
      {/* Main Dashboard Content */}
      <div className="rounded-theme border border-island_border bg-island_background p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Main Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your farm management system</p>
          </div>
        </div>
        
        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="p-4 rounded-theme border border-island_border bg-accent/20">
            <h3 className="text-sm font-medium text-muted-foreground">Total Servers</h3>
            <p className="text-2xl font-bold text-foreground">12</p>
          </div>
          <div className="p-4 rounded-theme border border-island_border bg-accent/20">
            <h3 className="text-sm font-medium text-muted-foreground">Active Services</h3>
            <p className="text-2xl font-bold text-primary">24</p>
          </div>
          <div className="p-4 rounded-theme border border-island_border bg-accent/20">
            <h3 className="text-sm font-medium text-muted-foreground">Storage Used</h3>
            <p className="text-2xl font-bold text-foreground">2.4TB</p>
          </div>
          <div className="p-4 rounded-theme border border-island_border bg-accent/20">
            <h3 className="text-sm font-medium text-muted-foreground">Uptime</h3>
            <p className="text-2xl font-bold text-green-500">99.9%</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-theme border border-island_border bg-island_background hover:bg-accent/50 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-foreground mb-2">Server Management</h3>
            <p className="text-sm text-muted-foreground">Monitor and manage your physical and virtual servers</p>
          </div>
          <div className="p-4 rounded-theme border border-island_border bg-island_background hover:bg-accent/50 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-foreground mb-2">Network Overview</h3>
            <p className="text-sm text-muted-foreground">View network topology and device status</p>
          </div>
          <div className="p-4 rounded-theme border border-island_border bg-island_background hover:bg-accent/50 transition-colors cursor-pointer">
            <h3 className="text-lg font-semibold text-foreground mb-2">Monitoring</h3>
            <p className="text-sm text-muted-foreground">Access Grafana dashboards and system metrics</p>
          </div>
        </div>
      </div>
    </div>
  );
}