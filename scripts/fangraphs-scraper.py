#!/usr/bin/env python3
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
import pandas as pd
import time
import os

class FanGraphsScraper:
    def __init__(self, username, password):
        self.username = username
        self.password = password
        self.driver = None
        self.base_url = "https://www.fangraphs.com"
        
    def start_driver(self):
        print("🌐 Starting Chrome driver...")
        chrome_options = Options()
        self.driver = webdriver.Chrome(options=chrome_options)
        print("✓ Chrome driver ready")
    
    def login(self):
        print("🔐 Logging into FanGraphs...")
        
        self.driver.get(f"{self.base_url}/login")
        time.sleep(5)
        
        try:
            # Wait for username field
            username_field = WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.ID, "UserName"))
            )
            print("✓ Found username field")
            username_field.clear()
            username_field.send_keys(self.username)
            time.sleep(1)
            
            # Find and fill password
            password_field = WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.ID, "Password"))
            )
            print("✓ Found password field")
            password_field.clear()
            password_field.send_keys(self.password)
            time.sleep(1)
            
            # Find and click login button
            login_btn = WebDriverWait(self.driver, 10).until(
                EC.element_to_be_clickable((By.XPATH, "//button[@type='submit']"))
            )
            print("✓ Found login button, clicking...")
            login_btn.click()
            
            time.sleep(6)
            
            # Check if logged in
            current_url = self.driver.current_url
            print(f"Current URL: {current_url}")
            
            if "login" not in current_url.lower():
                print("✓ Login successful!")
                return True
            else:
                print("✗ Still on login page")
                return False
                
        except Exception as e:
            print(f"✗ Login error: {e}")
            print(f"Page title: {self.driver.title}")
            return False
    
    def scrape_pitcher_stats(self, season=2026):
        print(f"\n📊 Scraping pitcher stats ({season})...")
        
        url = f"{self.base_url}/leaders/major-league/pitcher?Season={season}"
        self.driver.get(url)
        time.sleep(5)
        
        try:
            WebDriverWait(self.driver, 15).until(
                EC.presence_of_element_located((By.TAG_NAME, "table"))
            )
            
            for _ in range(3):
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(1)
            
            table = self.driver.find_element(By.TAG_NAME, "table")
            df = pd.read_html(table.get_attribute('outerHTML'))[0]
            
            print(f"✓ Extracted {len(df)} pitchers")
            
            os.makedirs('data', exist_ok=True)
            df.to_csv('data/pitcher_stats.csv', index=False)
            print("✓ Saved to data/pitcher_stats.csv")
            
            return df
            
        except Exception as e:
            print(f"✗ Error scraping pitchers: {e}")
            return None
    
    def close(self):
        if self.driver:
            self.driver.quit()
            print("✓ Driver closed")

def main():
    print("FanGraphs Selenium Scraper")
    print("=" * 50)
    
    username = input("Enter FanGraphs username: ")
    password = input("Enter FanGraphs password: ")
    
    scraper = FanGraphsScraper(username, password)
    
    try:
        scraper.start_driver()
        if not scraper.login():
            print("Failed to login. Check your credentials.")
            scraper.close()
            return
        
        pitcher_df = scraper.scrape_pitcher_stats(season=2026)
        
        print("\n✅ FanGraphs scraping complete!")
        
    except Exception as e:
        print(f"\n✗ Error: {e}")
    
    finally:
        scraper.close()

if __name__ == "__main__":
    main()
