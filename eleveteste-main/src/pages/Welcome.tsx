import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/30 flex flex-col items-center justify-center px-6 overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="flex flex-col items-center justify-center z-10"
      >
        {/* Logo Container */}
        <motion.div
          className="relative cursor-pointer select-none"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setIsHovered(false)}
        >
          {/* The Elev Logo */}
          <div className="flex items-baseline text-7xl sm:text-8xl md:text-9xl font-bold tracking-tight">
            {/* The "E" that rotates */}
            <motion.span
              className="text-primary inline-block origin-bottom"
              animate={{
                rotate: isHovered ? -12 : 0,
                x: isHovered ? -4 : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
              }}
            >
              E
            </motion.span>
            
            {/* "leve" text */}
            <motion.span
              className="text-foreground"
              animate={{
                x: isHovered ? -2 : 0,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20,
                delay: 0.05,
              }}
            >
              leve
            </motion.span>
          </div>

          {/* Estudos subtitle */}
          <motion.div
            className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-widest text-foreground mt-2"
            animate={{
              opacity: isHovered ? 1 : 0.85,
            }}
            transition={{
              duration: 0.3,
            }}
          >
            Estudos
          </motion.div>

          {/* Subtle glow effect on hover */}
          <motion.div
            className="absolute inset-0 -z-10 rounded-3xl"
            animate={{
              boxShadow: isHovered 
                ? "0 0 80px 20px hsl(var(--primary) / 0.15)" 
                : "0 0 0px 0px hsl(var(--primary) / 0)",
            }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>

        {/* Welcome text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 text-xl sm:text-2xl text-muted-foreground font-light tracking-wide text-center"
        >
          Bem-vindo à plataforma Eleve
        </motion.p>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-3 text-sm sm:text-base text-muted-foreground/70 font-light text-center max-w-sm"
        >
          Sua jornada de aprendizado começa aqui
        </motion.p>

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-12"
        >
          <Button
            variant="ghost"
            size="lg"
            onClick={() => navigate("/login")}
            className="group text-muted-foreground hover:text-foreground hover:bg-transparent transition-all duration-300"
          >
            <span className="font-light tracking-wide">Vamos lá</span>
            <motion.div
              animate={{ x: isHovered ? 0 : [0, 4, 0] }}
              transition={{ 
                duration: 1.5, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
            >
              <ArrowRight className="ml-2 h-4 w-4 opacity-60 group-hover:opacity-100 transition-opacity" />
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>

      {/* Bottom fade indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="w-1 h-8 rounded-full bg-gradient-to-b from-muted-foreground/20 to-transparent"
        />
      </motion.div>
    </div>
  );
};

export default Welcome;
