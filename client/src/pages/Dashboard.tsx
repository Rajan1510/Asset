import { useAssets } from "@/hooks/use-assets";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { 
  Package, 
  CheckCircle2, 
  UserCheck, 
  Wrench,
  Loader2 
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export default function Dashboard() {
  const { data: assets, isLoading } = useAssets();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const allAssets = assets || [];
  
  // Calculate Stats
  const totalAssets = allAssets.length;
  const availableAssets = allAssets.filter(a => a.is_available).length;
  const assignedAssets = allAssets.filter(a => !a.is_available && a.assigned_to).length;
  const underRepair = allAssets.filter(a => a.working_condition === "Under Repair").length;

  // Data for Charts
  const conditionData = [
    { name: 'Working', value: allAssets.filter(a => a.working_condition === 'Working').length },
    { name: 'Repair', value: allAssets.filter(a => a.working_condition === 'Under Repair').length },
    { name: 'Broken', value: allAssets.filter(a => a.working_condition === 'Not Working').length },
  ];

  // Group by Profile/Department
  const departmentCounts: Record<string, number> = {};
  allAssets.forEach(a => {
    const dept = a.profile || 'Unassigned';
    departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
  });
  
  const departmentData = Object.entries(departmentCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5); // Top 5

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold font-display tracking-tight text-slate-900">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Overview of your asset inventory.</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={item}>
          <StatsCard
            title="Total Assets"
            value={totalAssets}
            icon={Package}
            className="border-l-4 border-l-blue-500"
            iconClassName="bg-blue-100 text-blue-600"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Available"
            value={availableAssets}
            icon={CheckCircle2}
            className="border-l-4 border-l-green-500"
            iconClassName="bg-green-100 text-green-600"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Assigned"
            value={assignedAssets}
            icon={UserCheck}
            className="border-l-4 border-l-purple-500"
            iconClassName="bg-purple-100 text-purple-600"
          />
        </motion.div>
        <motion.div variants={item}>
          <StatsCard
            title="Under Repair"
            value={underRepair}
            icon={Wrench}
            className="border-l-4 border-l-orange-500"
            iconClassName="bg-orange-100 text-orange-600"
          />
        </motion.div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="col-span-4"
        >
          <Card className="h-full border-none shadow-md">
            <CardHeader>
              <CardTitle>Assets by Department</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}`} 
                    />
                    <Tooltip 
                      cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="col-span-3"
        >
          <Card className="h-full border-none shadow-md">
            <CardHeader>
              <CardTitle>Asset Condition</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={conditionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {conditionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-4 text-sm mt-4">
                {conditionData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-muted-foreground">{entry.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
