"""
PDF Bank Statement Parser
Extracts transactions from PDF bank statements including PhonePe format
"""
import re
from datetime import datetime


def parse_pdf_statement(pdf_file, password=None):
    """
    Parse PDF bank statement and extract transactions with optional password support
    
    Args:
        pdf_file: PDF file object
        password: Optional password for encrypted PDFs
    
    Returns list of transactions: [{'date': '2026-04-20', 'amount': '-450.00', 'description': '...'}]
    """
    transactions = []
    
    try:
        # Import pdfplumber
        try:
            import pdfplumber
        except ImportError:
            raise Exception("pdfplumber library not installed")
        
        # Open PDF with optional password
        open_kwargs = {}
        if password:
            # Try password as string
            open_kwargs['password'] = str(password)
        
        try:
            with pdfplumber.open(pdf_file, **open_kwargs) as pdf:
                if not pdf.pages:
                    raise Exception("PDF has no readable pages")
                
                all_text = ""
                
                # Extract text from all pages
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        all_text += text + "\n"
                
                if not all_text.strip():
                    raise Exception("Could not extract text from PDF")
                
                # Try PhonePe format first
                phonepe_transactions = parse_phonepe_format(all_text)
                if phonepe_transactions:
                    return phonepe_transactions
                
                # Fallback to generic parser
                transactions = parse_generic_format(all_text)
                
            if not transactions:
                raise Exception("No valid transactions found in PDF. The PDF format may not be supported. Please ensure your PDF contains transaction details with dates, amounts, and descriptions.")
            
            return transactions
            
        except Exception as pdf_error:
            # Check if it's a password error
            error_msg = str(pdf_error).lower()
            if 'password' in error_msg or 'encrypted' in error_msg or 'decrypt' in error_msg:
                raise Exception("PDF is password-protected. Please enter the correct password.")
            raise pdf_error
    
    except Exception as e:
        raise Exception(f"Error parsing PDF: {str(e)}")


def parse_phonepe_format(text):
    """Parse PhonePe transaction statement format"""
    transactions = []
    lines = text.split('\n')
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Look for date pattern (Mar 18, 2026 or similar)
        date_match = re.search(r'([A-Z][a-z]{2}\s+\d{1,2},\s+\d{4})', line)
        
        if date_match:
            try:
                date_str = date_match.group(1)
                
                # Next few lines contain transaction details
                description = ""
                amount = None
                transaction_type = None
                
                # Look ahead for transaction details (check up to 15 lines)
                for j in range(i, min(i + 15, len(lines))):
                    check_line = lines[j].strip()
                    
                    # Look for "Paid to" or "Received from" (case insensitive)
                    if 'paid to' in check_line.lower():
                        parts = re.split(r'[Pp]aid to', check_line, maxsplit=1)
                        if len(parts) >= 2:
                            description = parts[1].strip()
                            transaction_type = 'Debit'
                    elif 'paid at' in check_line.lower():
                        parts = re.split(r'[Pp]aid at', check_line, maxsplit=1)
                        if len(parts) >= 2:
                            description = parts[1].strip()
                            transaction_type = 'Debit'
                    elif 'received from' in check_line.lower():
                        parts = re.split(r'[Rr]eceived from', check_line, maxsplit=1)
                        if len(parts) >= 2:
                            description = parts[1].strip()
                            transaction_type = 'Credit'
                    
                    # Look for amount with INR prefix (case insensitive, handle various formats)
                    amount_match = re.search(r'[Ii][Nn][Rr]\s*[₹]?\s*([\d,]+\.?\d*)', check_line)
                    if amount_match:
                        amount = amount_match.group(1).replace(',', '')
                        break
                
                if description and amount:
                    # Parse date
                    formatted_date = parse_date_text(date_str)
                    
                    # Make amount negative for debits
                    if transaction_type == 'Debit':
                        amount = f"-{amount}"
                    
                    transactions.append({
                        'date': formatted_date,
                        'amount': amount,
                        'description': description[:100]
                    })
                
                i += 1
            except Exception:
                i += 1
        else:
            i += 1
    
    return transactions


def parse_generic_format(text):
    """Parse generic bank statement format"""
    transactions = []
    lines = text.split('\n')
    
    for line in lines:
        line = line.strip()
        
        # Skip empty or very short lines
        if not line or len(line) < 10:
            continue
        
        # Look for date pattern
        date_match = re.search(r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})', line)
        if not date_match:
            continue
        
        # Look for amount pattern
        amount_match = re.search(r'[-+]?\d{1,}[,]?\d*\.?\d{2}', line)
        if not amount_match:
            continue
        
        try:
            date_str = date_match.group(1)
            amount_str = amount_match.group(0).replace(',', '')
            
            # Extract description
            desc_start = date_match.end()
            desc_end = amount_match.start()
            description = line[desc_start:desc_end].strip()
            
            if not description or len(description) < 3:
                description = line[:date_match.start()].strip()
            
            if not description or len(description) < 3:
                description = "Transaction"
            
            # Parse date
            formatted_date = parse_date(date_str)
            
            # Make amount negative if positive
            if float(amount_str) > 0:
                amount_str = f"-{amount_str}"
            
            transactions.append({
                'date': formatted_date,
                'amount': amount_str,
                'description': description[:100]
            })
        except Exception:
            continue
    
    return transactions


def parse_date_text(date_str):
    """Convert text date like 'Mar 18, 2026' to YYYY-MM-DD"""
    try:
        dt = datetime.strptime(date_str, '%b %d, %Y')
        return dt.strftime('%Y-%m-%d')
    except:
        # Try other formats
        return parse_date(date_str)


def parse_date(date_str):
    """Convert various date formats to YYYY-MM-DD"""
    date_str = date_str.strip()
    
    # Try different date formats
    formats = [
        '%d/%m/%Y', '%d-%m-%Y', '%d/%m/%y', '%d-%m-%y',
        '%Y-%m-%d', '%Y/%m/%d',
        '%m/%d/%Y', '%m-%d-%Y', '%m/%d/%y', '%m-%d-%y',
        '%b %d, %Y', '%B %d, %Y'
    ]
    
    for fmt in formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime('%Y-%m-%d')
        except ValueError:
            continue
    
    raise ValueError(f"Could not parse date: {date_str}")
