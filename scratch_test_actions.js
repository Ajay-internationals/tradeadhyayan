const puppeteer = require('puppeteer-core');
const path = require('path');

const clientEmail = "auto_client_" + Date.now() + "@example.com";
const mentorEmail = "auto_mentor_" + Date.now() + "@example.com";
const adminEmail = "admin@example.com";
const domain = "https://trade-adhyayan-next.vercel.app";

(async () => {
  let browser;
  try {
    console.log("Launching browser...");
    browser = await puppeteer.launch({
      executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setDefaultNavigationTimeout(120000);

    const logs = [];
    const errors = [];

    page.on('console', msg => {
      logs.push(`[Console][${msg.type()}] ${msg.text()}`);
      console.log(`[Browser Console] ${msg.text()}`);
    });
    
    page.on('pageerror', err => {
      errors.push(err.stack || err.message);
      console.error(`[Browser PageError] ${err.stack || err.message}`);
    });

    // 1. Establish session domain
    console.log(`\n--- STEP 1: Client login to initialize client: ${clientEmail} ---`);
    await page.goto(domain, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    await page.evaluate((email) => {
      localStorage.setItem('trade_adhyayan_user', email);
    }, clientEmail);
    await page.goto(`${domain}/dashboard`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 10000));
    await page.screenshot({ path: 'step1_client_dashboard.png' });
    console.log("Client dashboard screenshot saved.");

    // 2. Add a manual trade
    console.log("\n--- STEP 2: Logging a manual trade ---");
    const manualBtnExists = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.some(b => b.innerText.includes('Log Manual Entry'));
    });
    console.log("Log Manual Entry button exists: ", manualBtnExists);
    if (manualBtnExists) {
      await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const btn = buttons.find(b => b.innerText.includes('Log Manual Entry'));
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 3000));
      await page.screenshot({ path: 'step2_trade_modal.png' });

      console.log("Filling trade details...");
      await page.type('input[placeholder="e.g. RELIANCE"]', 'RELIANCE');
      await page.type('input[placeholder="e.g. 10"]', '10');
      await page.type('input[placeholder="e.g. 2400.50"]', '2400');
      await page.type('input[placeholder="e.g. 2420.00"]', '2450');
      
      const submitTradeBtn = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, input[type="submit"]'));
        const btn = buttons.find(b => b.innerText.includes('Save Trade') || b.innerText.includes('Submit'));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });
      console.log("Clicked Save Trade button: ", submitTradeBtn);
      await new Promise(r => setTimeout(r, 5000));
      await page.screenshot({ path: 'step2_trade_saved.png' });
    }

    // 3. Admin: Register Mentor
    console.log(`\n--- STEP 3: Admin login and mentor registration: ${mentorEmail} ---`);
    await page.evaluate((email) => {
      localStorage.setItem('trade_adhyayan_user', email);
    }, adminEmail);
    await page.goto(`${domain}/admin`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 5000));
    await page.screenshot({ path: 'step3_admin_management.png' });

    console.log("Filling mentor registration form...");
    await page.type('input[placeholder="e.g. Ajay Sharma"]', 'Auto Mentor');
    await page.type('input[placeholder="e.g. ajay@example.com"]', mentorEmail);
    await page.type('input[placeholder="e.g. +91 9988776655"]', '+91 1234567890');
    await page.type('input[placeholder="e.g. Options Buying Specialist"]', 'System Test Spec');
    await page.type('input[placeholder="e.g. F&O Intraday"]', 'System Testing');
    await page.type('input[placeholder="e.g. 7 Years"]', '10 Years');
    
    // Clear and type capacity
    await page.evaluate(() => {
      const capInput = document.querySelector('input[type="number"][placeholder="10"]');
      if (capInput) capInput.value = '';
    });
    await page.type('input[type="number"][placeholder="10"]', '10');

    // Clear and type payout
    await page.evaluate(() => {
      const payoutInput = document.querySelector('input[type="number"][placeholder="40.0"]');
      if (payoutInput) payoutInput.value = '';
    });
    await page.type('input[type="number"][placeholder="40.0"]', '45');

    const registerBtnClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('form button'));
      const btn = buttons.find(b => b.innerText.includes('Register') || b.innerText.includes('Submit'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log("Clicked Register Mentor button: ", registerBtnClicked);
    await new Promise(r => setTimeout(r, 6000));
    await page.screenshot({ path: 'step3_mentor_registered.png' });

    // 4. Admin: Allocate Client
    console.log("\n--- STEP 4: Admin: Allocating client to mentor ---");
    const clientTabClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      const btn = buttons.find(b => b.innerText.includes('Client Allocation'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log("Clicked Client Allocation tab: ", clientTabClicked);
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: 'step4_allocation_tab.png' });

    // Select Client and Mentor in dropdowns
    const dropdownSelectSuccess = await page.evaluate((cEmail, mEmail) => {
      const selects = Array.from(document.querySelectorAll('select'));
      if (selects.length >= 2) {
        // Find options matching client email and mentor email
        const clientSelect = selects[0];
        const mentorSelect = selects[1];
        
        const clientOpt = Array.from(clientSelect.options).find(o => o.text.includes(cEmail));
        const mentorOpt = Array.from(mentorSelect.options).find(o => o.text.includes(mEmail) || o.text.includes('Auto Mentor'));
        
        if (clientOpt && mentorOpt) {
          clientSelect.value = clientOpt.value;
          mentorSelect.value = mentorOpt.value;
          // Dispatch change event
          clientSelect.dispatchEvent(new Event('change', { bubbles: true }));
          mentorSelect.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
      }
      return false;
    }, clientEmail, mentorEmail);
    
    console.log("Dropdown select client & mentor: ", dropdownSelectSuccess);
    await page.screenshot({ path: 'step4_dropdowns_selected.png' });

    if (dropdownSelectSuccess) {
      const allocateBtnClicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button[type="submit"]'));
        const btn = buttons.find(b => b.innerText.includes('Allocate') || b.innerText.includes('Assign'));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });
      console.log("Clicked Allocate Client button: ", allocateBtnClicked);
      await new Promise(r => setTimeout(r, 6000));
      await page.screenshot({ path: 'step4_allocated.png' });
    }

    // 5. Client: Submit Review Request
    console.log(`\n--- STEP 5: Client submitting review request ---`);
    await page.evaluate((email) => {
      localStorage.setItem('trade_adhyayan_user', email);
    }, clientEmail);
    await page.goto(`${domain}/dashboard`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 10000));
    
    // Select Mentor Review tab
    const mentorReviewTabClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      const btn = buttons.find(b => b.innerText.includes('Mentor Review'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log("Clicked Mentor Review tab in sidebar: ", mentorReviewTabClicked);
    await new Promise(r => setTimeout(r, 5000));
    await page.screenshot({ path: 'step5_client_mentor_overview.png' });

    // Click "Submit Review" sub-tab
    const submitSubTabClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, span'));
      const btn = buttons.find(b => b.innerText.includes('Submit Review'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log("Clicked Submit Review sub-tab: ", submitSubTabClicked);
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: 'step5_submit_form_tab.png' });

    // Select the trade and submit review request
    const reviewSubmitted = await page.evaluate(() => {
      // Check the first checkbox
      const checkbox = document.querySelector('input[type="checkbox"]');
      if (checkbox) {
        // Trigger click on parent div to select trade
        checkbox.closest('div').click();
      }
      
      const textarea = document.querySelector('textarea');
      if (textarea) {
        textarea.value = "Review request submitted via integration test automated run.";
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
      }
      
      const buttons = Array.from(document.querySelectorAll('button[type="submit"]'));
      const btn = buttons.find(b => b.innerText.includes('Submit Review Request') || b.innerText.includes('Submit'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log("Selected trade and clicked submit: ", reviewSubmitted);
    await new Promise(r => setTimeout(r, 6000));
    await page.screenshot({ path: 'step5_review_submitted.png' });

    // 6. Mentor: Submit Evaluation Scorecard
    console.log(`\n--- STEP 6: Mentor evaluator login: ${mentorEmail} ---`);
    await page.evaluate((email) => {
      localStorage.setItem('trade_adhyayan_user', email);
    }, mentorEmail);
    await page.goto(`${domain}/mentor`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 8000));
    await page.screenshot({ path: 'step6_mentor_dashboard.png' });

    // Find evaluation requests
    const pendingRequestsCount = await page.evaluate(() => {
      const body = document.body.innerText;
      return body.includes('PENDING EVALUATION');
    });
    console.log("Pending evaluation section exists: ", pendingRequestsCount);

    const evaluateBtnClicked = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Evaluate') || b.innerText.includes('Review'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });
    console.log("Clicked Evaluate Client button: ", evaluateBtnClicked);
    await new Promise(r => setTimeout(r, 4000));
    await page.screenshot({ path: 'step6_mentor_evaluation_form.png' });

    if (evaluateBtnClicked) {
      console.log("Filling evaluation scorecard scores & notes...");
      await page.type('input[placeholder="e.g. 85"]', '90'); // Execution Score
      await page.type('input[placeholder="e.g. 75"]', '85'); // Risk Score
      await page.type('input[placeholder="e.g. 80"]', '95'); // Psychology Score
      await page.type('input[placeholder="e.g. 90"]', '90'); // Discipline Score

      await page.type('textarea[placeholder="What did the trader do well?"]', "Strong risk management on reliance trade.");
      await page.type('textarea[placeholder="Where can the trader improve?"]', "Avoid early exits.");
      await page.type('textarea[placeholder="E.g. Revenge trading, position sizing"]', "None");
      await page.type('textarea[placeholder="Specific actions to take next week"]', "Stick to the target.");

      const submitEvaluationClicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button[type="submit"]'));
        const btn = buttons.find(b => b.innerText.includes('Publish Evaluation') || b.innerText.includes('Submit'));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      });
      console.log("Clicked Publish Evaluation button: ", submitEvaluationClicked);
      await new Promise(r => setTimeout(r, 6000));
      await page.screenshot({ path: 'step6_evaluation_published.png' });
    }

    // 7. Client: Verify Scores
    console.log(`\n--- STEP 7: Client verifying published scorecard ---`);
    await page.evaluate((email) => {
      localStorage.setItem('trade_adhyayan_user', email);
    }, clientEmail);
    await page.goto(`${domain}/dashboard`, { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 10000));
    
    // Click Mentor Review tab
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('aside button'));
      const btn = buttons.find(b => b.innerText.includes('Mentor Review'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 5000));
    await page.screenshot({ path: 'step7_scores_verified.png' });
    
    const clientBodyText = await page.evaluate(() => document.body.innerText);
    console.log("Final verification text: ", clientBodyText.substring(0, 1000));

    console.log("\n=== ERRORS DETECTED ===");
    console.log(errors.join('\n'));

  } catch (error) {
    console.error("Automation flow error:", error);
  } finally {
    if (browser) {
      await browser.close();
    }
    console.log("Automation Done.");
  }
})();
