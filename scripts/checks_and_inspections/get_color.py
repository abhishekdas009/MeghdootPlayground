from PIL import Image

img = Image.open(r"C:\Users\Abhishek\.gemini\antigravity\brain\a97217df-d6a6-4b95-b5dd-f426d4809b62\.user_uploaded\media_1787940927023.png")
rgb = img.getpixel((img.width // 4, img.height // 4))  # get a pixel from the background (top-left quadrant)
hex_color = "#{:02x}{:02x}{:02x}".format(rgb[0], rgb[1], rgb[2])
print("Background Color:", hex_color, rgb)
