import { useState } from "react";
import { ColorResult, SketchPicker } from "react-color";
import { invoke } from "@tauri-apps/api/core";

import "./App.css";

function App() {
  const [color, setColor] = useState<ColorResult | null>(null);
  const [gradient, setGradient] = useState<number[][] | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-6 md:p-12">
      <div className="max-w-7xl mx-auto">
        {/* Glass-morphic Header */}
        <h1 className="text-4xl md:text-6xl font-black text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-pink-300 to-blue-300 drop-shadow-lg">
          Gradient Palette Generator
        </h1>

        <div className="backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl p-8 md:p-12 border border-white/20">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Color Picker Section */}
            <div className="w-full lg:w-1/3">
              <div className="backdrop-blur-md bg-white/20 rounded-2xl p-6 shadow-xl border border-white/30">
                <h2 className="text-xl font-bold text-white mb-6 text-center">
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
                  className="!bg-transparent border-none shadow-2xl w-full"
                />
              </div>
            </div>

            {/* Generated Colors Section */}
            <div className="w-full lg:w-2/3">
              {gradient ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {gradient.map((color, index) => (
                    <div
                      key={index}
                      className="group relative aspect-square rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
                      style={{ backgroundColor: `rgb(${color.join(",")})` }}
                    >
                      {/* Color Info Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-sm">
                        <div className="text-center">
                          <p className="text-white font-mono text-sm">
                            RGB({color.join(",")})
                          </p>
                          <button
                            onClick={() =>
                              navigator.clipboard.writeText(
                                `rgb(${color.join(",")})`
                              )
                            }
                            className="mt-2 px-3 py-1 bg-white/20 rounded-full text-xs text-white hover:bg-white/30 transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
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
  );
}

export default App;
