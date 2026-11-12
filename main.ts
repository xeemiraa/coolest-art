#!/usr/bin/env python3
"""
coolest-art-01 competition entry
Generates impressive generative art using PIL
"""

from PIL import Image, ImageDraw, ImageFilter, ImagePalette
import math
import random
import os

# Ensure output directory exists
os.makedirs("/output", exist_ok=True)

WIDTH, HEIGHT = 1024, 1024

# --- Color palettes ---
def palette_sunset():
    return [
        (255, 50, 50),    # red
        (255, 120, 50),   # orange
        (255, 200, 50),   # yellow
        (50, 180, 255),   # blue
        (180, 50, 255),   # purple
        (255, 50, 180),   # pink
    ]

def palette_neon():
    return [
        (0, 255, 200),    # cyan
        (255, 0, 100),    # magenta
        (100, 255, 0),    # lime
        (255, 200, 0),    # gold
        (0, 100, 255),    # deep blue
        (255, 100, 255),  # light purple
    ]

def palette_earth():
    return [
        (34, 139, 34),    # forest green
        (255, 200, 100),  # sandy
        (139, 90, 43),    # brown
        (200, 220, 255),  # sky
        (50, 100, 50),    # dark green
        (180, 160, 120),  # tan
    ]

# --- Draw mandala-like pattern ---
def draw_mandala(draw, cx, cy, max_radius, colors, layers=8):
    """Draw intricate mandala pattern with rotational symmetry"""
    for layer in range(layers):
        radius = max_radius * (layer + 1) / layers
        for petal in range(12 + layer * 2):
            angle = (2 * math.pi * petal) / (12 + layer * 2)
            
            # Petal tips
            tip_x = cx + radius * math.cos(angle)
            tip_y = cy + radius * math.sin(angle)
            
            # Inner point
            inner_r = radius * 0.4
            inner_x = cx + inner_r * math.cos(angle + math.pi / (12 + layer * 2))
            inner_y = cy + inner_r * math.sin(angle + math.pi / (12 + layer * 2))
            
            # Draw petal
            color = colors[layer % len(colors)]
            draw.polygon([
                (cx, cy),
                (tip_x, tip_y),
                (inner_x, inner_y),
            ], fill=color, outline=(255,255,255,50))
            
            # Draw curved petal tip
            bezier_pts = []
            for t in range(11):
                t_norm = t / 10
                # Quadratic bezier
                bx = (1-t_norm)**2 * cx + 2*(1-t_norm)*t_norm * inner_x + t_norm**2 * tip_x
                by = (1-t_norm)**2 * cy + 2*(1-t_norm)*t_norm * inner_y + t_norm**2 * tip_y
                bezier_pts.append((bx, by))
            
            for i in range(len(bezier_pts)-1):
                draw.line([bezier_pts[i], bezier_pts[i+1]], 
                         fill=colors[(layer+1) % len(colors)], width=2)

# --- Draw geometric spiral ---
def draw_spiral(draw, cx, cy, max_radius, colors, turns=5):
    """Draw colorful spiral pattern"""
    points = []
    for i in range(1000):
        angle = i * 0.1
        radius = max_radius * (i / 1000) * turns
        x = cx + radius * math.cos(angle)
        y = cy + radius * math.sin(angle)
        points.append((x, y))
    
    for i in range(len(points)-1):
        color_idx = int(i / 50) % len(colors)
        draw.line([points[i], points[i+1]], 
                  fill=colors[color_idx], width=3)

# --- Draw radial gradient burst ---
def draw_radial_burst(draw, cx, cy, max_radius, colors):
    """Draw radial gradient burst effect"""
    for r in range(max_radius, 0, -2):
        color_idx = int((max_radius - r) / 5) % len(colors)
        color = colors[color_idx]
        alpha = int(255 * (r / max_radius))
        
        # Draw ring
        for angle in range(0, 360, 3):
            rad = math.radians(angle)
            x1 = cx + r * math.cos(rad)
            y1 = cy + r * math.sin(rad)
            x2 = cx + (r-2) * math.cos(rad)
            y2 = cy + (r-2) * math.sin(rad)
            draw.line([(x1, y1), (x2, y2)], fill=color)

# --- Draw fractal tree ---
def draw_fractal_tree(draw, x, y, length, angle, depth, colors, max_depth=10):
    """Recursive fractal tree"""
    if depth <= 0 or length < 2:
        return
    
    end_x = x + length * math.cos(angle)
    end_y = y - length * math.sin(angle)
    
    color_idx = max_depth - depth
    color = colors[color_idx % len(colors)] if color_idx < len(colors) else colors[-1]
    
    draw.line([(x, y), (end_x, end_y)], fill=color, width=max(1, depth))
    
    # Branch
    new_length = length * 0.7
    spread = math.pi / 4
    
    draw_fractal_tree(draw, end_x, end_y, new_length, angle - spread, depth - 1, colors, max_depth)
    draw_fractal_tree(draw, end_x, end_y, new_length, angle + spread, depth - 1, colors, max_depth)
    draw_fractal_tree(draw, end_x, end_y, new_length * 0.8, angle, depth - 1, colors, max_depth)

# --- Draw hypnotic circles ---
def draw_hypnotic_circles(draw, cx, cy, max_radius, colors):
    """Draw concentric hypnotic circles with offset centers"""
    for i in range(20, 0, -1):
        radius = max_radius * i / 20
        offset = i * 5
        color_idx = i % len(colors)
        
        # Main circle
        draw.ellipse(
            [cx - radius, cy - radius, cx + radius, cy + radius],
            outline=colors[color_idx], width=2
        )
        
        # Offset circles
        for angle in range(0, 360, 45):
            rad = math.radians(angle)
            ox = cx + offset * math.cos(rad)
            oy = cy + offset * math.sin(rad)
            draw.ellipse(
                [ox - radius*0.6, oy - radius*0.6, ox + radius*0.6, oy + radius*0.6],
                outline=colors[(color_idx+1) % len(colors)], width=1
            )

# --- Draw lightning/energy patterns ---
def draw_lightning(draw, x1, y1, x2, y2, detail, colors, branch_prob=0.3):
    """Recursive lightning bolt"""
    if detail <= 0:
        return
    
    mid_x = (x1 + x2) / 2 + random.uniform(-30, 30)
    mid_y = (y1 + y2) / 2 + random.uniform(-30, 30)
    
    color = random.choice(colors)
    draw.line([(x1, y1), (mid_x, mid_y)], fill=color, width=2)
    draw.line([(mid_x, mid_y), (x2, y2)], fill=color, width=2)
    
    if random.random() < branch_prob:
        offset_x = random.uniform(-20, 20)
        offset_y = random.uniform(-20, 20)
        draw_lightning(draw, mid_x, mid_y, mid_x + offset_x, mid_y + offset_y, 
                      detail - 1, colors, branch_prob * 0.5)
    
    draw_lightning(draw, x1, y1, mid_x, mid_y, detail - 1, colors, branch_prob)
    draw_lightning(draw, mid_x, mid_y, x2, y2, detail - 1, colors, branch_prob)

# --- Main art generation ---
def generate_art():
    """Generate impressive generative art"""
    img = Image.new("RGB", (WIDTH, HEIGHT), (10, 10, 20))
    draw = ImageDraw.Draw(img)
    
    # Create color palettes
    sunset = palette_sunset()
    neon = palette_neon()
    earth = palette_earth()
    
    # Background gradient
    for y in range(HEIGHT):
        for x in range(0, WIDTH, 4):
            r = int(20 + 30 * math.sin(x / 100) * math.cos(y / 100))
            g = int(10 + 20 * math.cos(x / 80 + y / 120))
            b = int(30 + 40 * math.sin(y / 90))
            for dx in range(4):
                if x + dx < WIDTH:
                    img.putpixel((x + dx, y), (r, g, b))
    
    # Draw multiple art elements
    cx, cy = WIDTH // 2, HEIGHT // 2
    
    # 1. Hypnotic circles background
    draw_hypnotic_circles(draw, cx, cy, 400, neon)
    
    # 2. Mandala pattern
    draw_mandala(draw, cx, cy, 350, sunset, layers=6)
    
    # 3. Spiral overlay
    draw_spiral(draw, cx + 100, cy - 50, 250, earth, turns=4)
    
    # 4. Fractal tree in corner
    draw_fractal_tree(draw, 100, HEIGHT - 100, 120, math.pi/2, 8, neon, max_depth=8)
    draw_fractal_tree(draw, WIDTH - 100, HEIGHT - 100, 120, math.pi/2, 8, sunset, max_depth=8)
    
    # 5. Lightning effects
    for _ in range(5):
        x1 = random.randint(0, WIDTH)
        y1 = random.randint(0, HEIGHT)
        x2 = random.randint(0, WIDTH)
        y2 = random.randint(0, HEIGHT)
        draw_lightning(draw, x1, y1, x2, y2, 4, neon, 0.4)
    
    # 6. Radial burst
    draw_radial_burst(draw, cx, cy, 300, [(255, 255, 255), (200, 200, 255), (150, 150, 255)])
    
    # 7. Geometric dots pattern
    for i in range(200):
        angle = random.uniform(0, 2 * math.pi)
        radius = random.uniform(50, 450)
        x = cx + radius * math.cos(angle)
        y = cy + radius * math.sin(angle)
        color = random.choice(sunset + neon)
        size = random.randint(2, 8)
        draw.ellipse([x-size, y-size, x+size, y+size], fill=color)
    
    # 8. Glow effect with blur
    img_blur = img.filter(ImageFilter.GaussianBlur(radius=3))
    img = Image.blend(img, img_blur, 0.15)
    
    # 9. Final overlay - golden ratio spirals hint
    for i in range(8):
        angle = i * math.pi / 4
        spiral_radius = 50 + i * 30
        for t in range(100):
            r = spiral_radius * math.exp(0.1 * t)
            if r > 400:
                break
            x = cx + r * math.cos(angle + t * 0.3)
            y = cy + r * math.sin(angle + t * 0.3)
            if 0 <= x < WIDTH and 0 <= y < HEIGHT:
                color = sunset[t % len(sunset)]
                draw.point((x, y), fill=color + (50,))
    
    return img

# --- Generate and save ---
if __name__ == "__main__":
    print("Generating coolest-art-01 entry...")
    art = generate_art()
    
    output_path = "/output/entry.png"
    art.save(output_path, "PNG")
    print(f"Art saved to {output_path}")
    print(f"Image size: {art.size}")
    print(f"Image mode: {art.mode}")
