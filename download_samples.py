"""
Legal Document Downloader

This script downloads sample legal documents from various public sources
to be used for testing and development of the LegalBriefAI application.
It stores the downloaded PDF files in the 'raw_documents' directory.
"""

import requests
import os

# Dictionary mapping filenames to their source URLs
SAMPLE_DOCUMENTS = {
    "CONFIDENTIALITY_IP_ASSIGNMENT_AGREEMENT.pdf": "https://www.startupindia.gov.in/content/dam/invest-india/Templates/public/Tools_templates/internal_templates/Lets_Venture/CONFIDENTIALITY_IP_ASSIGNMENT_AGREEMENT.pdf",
    "NON_DISCLOSURE_AGREEMENT.pdf": "https://www.startupindia.gov.in/content/dam/invest-india/Templates/public/Tools_templates/internal_templates/Lets_Venture/NON_DISCLOSURE_AGREEMENT.pdf",
    "med_dir_actualcontract.pdf": "https://dbm.maryland.gov/contracts/Documents/ContractLibrary/Services/StateMedDir2016/med_dir_actualcontract.pdf",
    "SampleContract-Shuttle.pdf": "https://sccrtc.org/wp-content/uploads/2010/09/SampleContract-Shuttle.pdf"
}

def download_documents():
    """
    Downloads the sample documents defined in SAMPLE_DOCUMENTS.
    Creates the output directory if it doesn't exist.
    """
    output_dir = "raw_documents"
    os.makedirs(output_dir, exist_ok=True)

    for filename, url in SAMPLE_DOCUMENTS.items():
        print(f"Downloading {filename}...")
        try:
            response = requests.get(url, timeout=30)
            if response.status_code == 200:
                file_path = os.path.join(output_dir, filename)
                with open(file_path, "wb") as f:
                    f.write(response.content)
                print(f"Successfully downloaded {filename}.")
            else:
                print(f"Failed to download {filename}. Status code: {response.status_code}")
        except Exception as e:
            print(f"Error downloading {filename}: {str(e)}")

if __name__ == "__main__":
    download_documents()
