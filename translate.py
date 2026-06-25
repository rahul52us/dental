import json
from deep_translator import GoogleTranslator
import time
import re

def translate_value(value, dest_lang):
    if not isinstance(value, str):
        return value
        
    if not value.strip():
        return value
        
    try:
        # Extract variables like {{name}} to prevent translating them
        # Temporarily replace them with markers
        vars = re.findall(r'\{\{[^}]+\}\}', value)
        temp_val = value
        for i, v in enumerate(vars):
            temp_val = temp_val.replace(v, f'__VAR{i}__')
            
        translated = GoogleTranslator(source='en', target=dest_lang).translate(temp_val)
        
        # Restore variables
        if translated:
            for i, v in enumerate(vars):
                translated = translated.replace(f'__VAR{i}__', v)
            return translated
        return value
    except Exception as e:
        print(f"Error translating '{value}': {e}")
        return value

def translate_dict(data, dest_lang):
    translated_data = {}
    for key, value in data.items():
        if isinstance(value, dict):
            translated_data[key] = translate_dict(value, dest_lang)
        elif isinstance(value, str):
            print(f"Translating key '{key}' -> '{value[:20]}...'", flush=True)
            translated_data[key] = translate_value(value, dest_lang)
            time.sleep(0.1) # Be nice to the API
        else:
            translated_data[key] = value
    return translated_data

def main():
    source_file = r"d:\personal\dental\dental-frontend\app\locales\en.json"
    
    with open(source_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    languages = {
        'ta': r"d:\personal\dental\dental-frontend\app\locales\ta.json",
        'mr': r"d:\personal\dental\dental-frontend\app\locales\mr.json",
        'te': r"d:\personal\dental\dental-frontend\app\locales\te.json"
    }
    
    for lang_code, dest_file in languages.items():
        print(f"Translating to {lang_code}...", flush=True)
        translated_data = translate_dict(data, lang_code)
        
        with open(dest_file, 'w', encoding='utf-8') as f:
            json.dump(translated_data, f, ensure_ascii=False, indent=2)
            
        print(f"Saved {dest_file}", flush=True)

if __name__ == '__main__':
    main()
