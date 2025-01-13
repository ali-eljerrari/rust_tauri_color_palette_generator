/// This module provides functionality to generate a color gradient based on RGB input.
///
/// The `Srgb` type is an alias for `Rgb<Srgb, T>`, which is the standard color space for most images.
/// The `LinSrgb` type is an alias for `Rgb<Linear<Srgb>, T>`, which is more suitable for color manipulation.
use palette::{Lch, Srgb, FromColor, Gradient};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
/// The entry point for the Tauri application. It initializes the application and sets up the necessary plugins and handlers.
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![generate_gradient_from_rgb_impl])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Generates a color gradient based on the provided RGB values.
///
/// # Parameters
/// - `r`: The red component of the color (0-255).
/// - `g`: The green component of the color (0-255).
/// - `b`: The blue component of the color (0-255).
///
/// # Returns
/// A vector of vectors, where each inner vector represents an RGB color in the gradient.
///
/// This function generates a gradient based on the input RGB values. For instance, if the input RGB values are (255, 0, 0), the output might look like this:
///
/// ```
/// let example_output = vec![
///     vec![255, 0, 0],   // Bright red
///     vec![204, 51, 51], // A lighter shade of red
///     vec![153, 102, 102], // Even lighter shade
///     vec![102, 153, 153], // Transitioning towards a different hue
///     vec![51, 204, 204], // Further transition
///     vec![0, 255, 255],   // Bright cyan
///     vec![0, 204, 204],   // A darker shade of cyan
///     vec![0, 153, 153],   // Even darker shade
///     vec![0, 102, 102],   // Darkest shade before reaching black
/// ];
/// ```
#[tauri::command]
fn generate_gradient_from_rgb_impl(r: u8, g: u8, b: u8) -> Vec<Vec<u8>> {
    // Convert the RGB values from the range 0-255 to a normalized range 0.0-1.0 for color processing.
    let my_rgb = Srgb::new(r as f32 / 255.0, g as f32 / 255.0, b as f32 / 255.0);

    // Convert the normalized RGB color to the LCH color space for better gradient manipulation.
    let my_lch = Lch::from_color(my_rgb.into_linear());

    // Create a gradient using the LCH color space, defining three key colors for the gradient.
    let gradient = Gradient::new(vec![
        // Start color at lightness 0.0 with the same chroma and hue as the input color.
        Lch::new(0.0, my_lch.chroma, my_lch.hue),
        // Middle color is the input color itself.
        my_lch,
        // End color at lightness 128.0 with the same chroma and hue as the input color.
        Lch::new(128.0, my_lch.chroma, my_lch.hue),
    ]);

    // Generate a vector of RGB colors from the gradient, taking the first 9 colors.
    let colors = gradient
        .take(9)
        .map(|color| {
            // Convert each LCH color back to RGB and extract the components.
            let (r, g, b) = Srgb::from_color(color).into_components();
            // Scale the RGB components back to the range 0-255.
            vec![
                (r * 255.0) as u8,
                (g * 255.0) as u8,
                (b * 255.0) as u8,
            ]
        })
        .collect::<Vec<_>>();

    // Return the vector of RGB colors representing the gradient.
    colors
}

