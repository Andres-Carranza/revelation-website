import schedule
import time
from tsa_scraper import scrape_tsa
from covid_scraper import scrape_covid
from claims_scraper import scrape_claims
from unemployment_scraper import scrape_unemployment

def run_scrapers():
    scrape_tsa.scrape()
    scrape_covid.scrape()
    scrape_claims.scrape()
    scrape_unemployment.scrape()


schedule.every().day.at('06:10').do(run_scrapers)
#schedule.every().day.at('19:13').do(run_scrapers)

while True:
    schedule.run_pending()
    time.sleep(1)