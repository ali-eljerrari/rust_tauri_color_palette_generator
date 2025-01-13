import { useState, useEffect } from "react";
import { ColorResult, SketchPicker } from "react-color";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "./hooks/use-toast";
import { Toaster } from "./components/ui/toaster";
import "./App.css";

function App() {
  const [color, setColor] = useState<ColorResult | null>(null);
  const [gradient, setGradient] = useState<number[][] | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    invoke("generate_gradient_from_rgb_impl", {
      r: Math.floor(Math.random() * 256),
      g: Math.floor(Math.random() * 256),
      b: Math.floor(Math.random() * 256),
    }).then((gradient) => {
      setGradient(gradient as number[][]);
    });
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-6 md:p-12 transition-all duration-500">
        <div className="max-w-7xl mx-auto">
          {/* Glass-morphic Header */}
          <h1 className="text-5xl md:text-7xl font-extrabold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-blue-400 drop-shadow-2xl">
            Gradient Palette Generator
          </h1>

          <div className="backdrop-blur-xl bg-white/20 rounded-3xl shadow-2xl p-8 md:p-12 border border-white/30">
            <div className="flex flex-col lg:flex-row gap-12 items-center">
              {/* Color Picker Section */}
              <div className="w-full lg:w-1/3 flex items-center justify-center">
                <div className="backdrop-blur-md bg-white/30 rounded-2xl p-6 shadow-xl border border-white/40 transition-shadow hover:shadow-2xl">
                  <h2 className="text-2xl font-bold text-white mb-6 text-center">
                    Choose Your Color
                  </h2>
                  <SketchPicker
                    color={color?.rgb}
                    onChange={(color) => {
                      setColor(color);
                      invoke("generate_gradient_from_rgb_impl", {
                        r: color.rgb.r,
                        g: color.rgb.g,
                        b: color.rgb.b,
                      }).then((gradient) => {
                        setGradient(gradient as number[][]);
                      });
                    }}
                    className="!bg-transparent border-none shadow-2xl"
                  />
                </div>
              </div>

              {/* Generated Colors Section */}
              <div className="w-full lg:w-2/3">
                {gradient ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {gradient.map((color, index) => {
                      return (
                        <div
                          key={index}
                          className="group relative aspect-square rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                          style={{ backgroundColor: `rgb(${color.join(",")})` }}
                        >
                          {/* Color Info Overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                            <div className="text-center">
                              <p className="text-white font-mono text-sm">
                                RGB({color.join(",")})
                              </p>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(
                                    `rgb(${color.join(",")})`
                                  );
                                  setCopiedIndex(index);
                                  setTimeout(() => setCopiedIndex(null), 2000);
                                  toast({
                                    title: "Copied!",
                                    description: `RGB color code copied to clipboard rgb(${color.join(
                                      ","
                                    )})`,
                                    variant: "default",
                                  });
                                }}
                                className="mt-2 px-3 py-1 bg-white/30 rounded-full text-xs text-white hover:bg-white/40 transition-colors"
                              >
                                {copiedIndex === index ? "Copied!" : "Copy"}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-white/70 text-xl font-light italic">
                      Choose a color to generate your palette...
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toaster />
    </>
  );
}

export default App;
