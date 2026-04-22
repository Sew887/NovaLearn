from PIL import Image

def remove_white_bg(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()
    
    newData = []
    for item in datas:
        if item[0] > 230 and item[1] > 230 and item[2] > 230:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)
            
    img.putdata(newData)
    img.save(output_path, "PNG")

if __name__ == '__main__':
    in_p = r"C:\Users\MSI\.gemini\antigravity\brain\c2bbaea8-6ca0-4537-99b2-b8fe196c9bb7\media__1776835335167.png"
    out_p = r"C:\Users\MSI\OneDrive\Desktop\Hackathon project\public\logo.png"
    remove_white_bg(in_p, out_p)
    print("Done!")
