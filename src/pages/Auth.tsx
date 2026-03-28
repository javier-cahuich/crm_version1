import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Registro exitoso. Por favor revisa tu correo o inicia sesión si el correo no requiere verificación.");
        // Switch to login mode
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Inicio de sesión exitoso.");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error en la autenticación");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{isSignUp ? "Crear cuenta" : "Iniciar Sesión"}</CardTitle>
          <CardDescription>
            {isSignUp ? "Ingresa tus datos para registrarte." : "Ingresa tus credenciales para acceder a la plataforma."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Cargando..." : (isSignUp ? "Registrarse" : "Ingresar")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => setIsSignUp(!isSignUp)} disabled={isLoading}>
            {isSignUp ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
