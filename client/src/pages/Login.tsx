import { Button } from "@/components/ui/button";
import { Building2, ArrowRight } from "lucide-react";

export default function Login() {
  return (
    <div className="min-h-screen w-full flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex w-1/2 bg-slate-900 text-white flex-col justify-between p-12 relative overflow-hidden">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-blue-500 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
          <div className="absolute left-0 bottom-0 w-[400px] h-[400px] bg-purple-500 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3"></div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-8">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-xl font-display">Asset Manager</span>
          </div>
        </div>

        <div className="relative z-10 max-w-lg">
          <h1 className="text-5xl font-bold font-display leading-tight mb-6">
            Track every asset,<br />
            <span className="text-blue-400">simplify</span> your IT.
          </h1>
          <p className="text-lg text-slate-300 leading-relaxed">
            A comprehensive solution for modern teams to manage inventory, track assignments, and maintain operational efficiency.
          </p>
        </div>

        <div className="relative z-10 text-sm text-slate-500">
          © {new Date().getFullYear()} Asset Manager Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Auth */}
      <div className="w-full lg:w-1/2 flex flex-col items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
              <div className="p-2 bg-primary rounded-lg text-primary-foreground">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="font-bold text-xl font-display">Asset Manager</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome back</h2>
            <p className="text-muted-foreground mt-2">Sign in to access your dashboard.</p>
          </div>

          <div className="pt-4">
            <Button 
              size="lg" 
              className="w-full h-12 text-base font-medium shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
              onClick={() => window.location.href = "/api/login"}
            >
              Log In with Replit
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            
            <p className="text-center text-xs text-muted-foreground mt-6">
              By clicking continue, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
