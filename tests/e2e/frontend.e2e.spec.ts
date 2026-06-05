import { test, expect, type Page } from '@playwright/test'

// Answer all 10 questions using data-score attributes.
// Scores 0-3 are always present on each question regardless of shuffle order.
async function answerAllQuestions(page: Page, scorePattern: number[]) {
  for (let i = 0; i < scorePattern.length; i++) {
    const score = scorePattern[i]
    await page.locator(`[data-testid="option-button"][data-score="${score}"]`).click()
    await page.getByTestId('next-button').click()
    // Wait for either the next question or the result screen
    if (i < scorePattern.length - 1) {
      await page.getByTestId('question-text').waitFor()
    }
  }
}

test.describe('Quiz — page load', () => {
  test('shows quiz title and first question', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('question-text')).toBeVisible()
    await expect(page.getByTestId('question-counter')).toHaveText('1 / 10')
  })

  test('shows 4 option buttons per question', async ({ page }) => {
    await page.goto('/')

    const options = page.getByTestId('option-button')
    await expect(options).toHaveCount(4)
  })

  test('Next button is disabled before selecting an option', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('next-button')).toBeDisabled()
  })

  test('header shows site title and Past results link', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByRole('link', { name: 'Cosmic Quiz' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Past results' })).toBeVisible()
  })
})

test.describe('Quiz — one question at a time navigation', () => {
  test('selecting an option enables the Next button', async ({ page }) => {
    await page.goto('/')

    await page.locator('[data-testid="option-button"][data-score="0"]').click()
    await expect(page.getByTestId('next-button')).toBeEnabled()
  })

  test('clicking Next advances to the next question', async ({ page }) => {
    await page.goto('/')

    await page.locator('[data-testid="option-button"][data-score="1"]').click()
    await page.getByTestId('next-button').click()

    await expect(page.getByTestId('question-counter')).toHaveText('2 / 10')
  })

  test('Back button is hidden on first question', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('back-button')).not.toBeVisible()
  })

  test('Back button appears on second question and returns to previous', async ({ page }) => {
    await page.goto('/')

    const firstQuestion = await page.getByTestId('question-text').textContent()

    await page.locator('[data-testid="option-button"][data-score="2"]').click()
    await page.getByTestId('next-button').click()
    await page.getByTestId('question-text').waitFor()

    await expect(page.getByTestId('back-button')).toBeVisible()

    await page.getByTestId('back-button').click()

    await expect(page.getByTestId('question-counter')).toHaveText('1 / 10')
    await expect(page.getByTestId('question-text')).toHaveText(firstQuestion!)
  })

  test('progress bar grows as questions are answered', async ({ page }) => {
    await page.goto('/')

    const progressBar = page.locator('.bg-accent').first()

    const widthBefore = await progressBar.evaluate((el) => (el as HTMLElement).style.width)

    await page.locator('[data-testid="option-button"][data-score="1"]').click()
    await page.getByTestId('next-button').click()
    await page.getByTestId('question-text').waitFor()

    const widthAfter = await progressBar.evaluate((el) => (el as HTMLElement).style.width)

    expect(widthBefore).not.toBe(widthAfter)
  })

  test('last question shows "See my result" button text', async ({ page }) => {
    await page.goto('/')

    for (let i = 0; i < 9; i++) {
      await page.locator('[data-testid="option-button"][data-score="0"]').click()
      await page.getByTestId('next-button').click()
      await page.getByTestId('question-text').waitFor()
    }

    await expect(page.getByTestId('next-button')).toHaveText('See my result')
  })
})

test.describe('Quiz — result screen', () => {
  test('shows score, label, and 10-row breakdown after completing quiz', async ({ page }) => {
    await page.goto('/')

    // All score-2 = total 20 → Cosmic Bear
    await answerAllQuestions(page, [2, 2, 2, 2, 2, 2, 2, 2, 2, 2])

    await page.getByTestId('result-score').waitFor()

    await expect(page.getByTestId('result-score')).toHaveText('20')
    await expect(page.getByTestId('result-label')).toContainText('Cosmic Bear')
    await expect(page.getByTestId('breakdown-row')).toHaveCount(10)
  })

  test('low score shows Mooncat result', async ({ page }) => {
    await page.goto('/')

    // All score-0 = total 0 → Mooncat
    await answerAllQuestions(page, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0])

    await page.getByTestId('result-score').waitFor()

    await expect(page.getByTestId('result-score')).toHaveText('0')
    await expect(page.getByTestId('result-label')).toContainText('Mooncat')
  })

  test('high score shows Galactic Dragon result', async ({ page }) => {
    await page.goto('/')

    // All score-3 = total 30 → Galactic Dragon
    await answerAllQuestions(page, [3, 3, 3, 3, 3, 3, 3, 3, 3, 3])

    await page.getByTestId('result-score').waitFor()

    await expect(page.getByTestId('result-score')).toHaveText('30')
    await expect(page.getByTestId('result-label')).toContainText('Galactic Dragon')
  })

  test('score 13 shows easter egg message', async ({ page }) => {
    await page.goto('/')

    // score-0 x2 + score-1 x3 + score-2 x5 = 0+3+10 = 13
    await answerAllQuestions(page, [0, 0, 1, 1, 1, 2, 2, 2, 2, 2])

    await page.getByTestId('result-score').waitFor()

    await expect(page.getByTestId('result-score')).toHaveText('13')
    await expect(page.getByTestId('result-label')).toHaveText(
      'You lucky fucker! You scored 13 exactly.',
    )
  })

  test('breakdown shows selected answers for each question', async ({ page }) => {
    await page.goto('/')

    await answerAllQuestions(page, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1])

    await page.getByTestId('result-score').waitFor()

    const rows = page.getByTestId('breakdown-row')
    await expect(rows).toHaveCount(10)

    // Each row should show a score of 1
    const firstRow = rows.first()
    await expect(firstRow).toContainText('1')
  })

  test('retake quiz button resets to first question', async ({ page }) => {
    await page.goto('/')

    await answerAllQuestions(page, [0, 0, 0, 0, 0, 0, 0, 0, 0, 0])
    await page.getByTestId('result-score').waitFor()

    await page.getByRole('button', { name: 'Take quiz again' }).click()

    await expect(page.getByTestId('question-counter')).toHaveText('1 / 10')
    await expect(page.getByTestId('next-button')).toBeDisabled()
  })
})

test.describe('Email save', () => {
  test('save button is disabled without email', async ({ page }) => {
    await page.goto('/')

    await answerAllQuestions(page, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
    await page.getByTestId('result-score').waitFor()

    await expect(page.getByTestId('save-button')).toBeDisabled()
  })

  test('saving with email shows confirmation and locks fields', async ({ page }) => {
    const email = `test-${Date.now()}@example.com`

    await page.goto('/')
    await answerAllQuestions(page, [2, 2, 2, 2, 2, 2, 2, 2, 2, 2])
    await page.getByTestId('result-score').waitFor()

    await page.getByLabel(/Notes/).fill('Playwright test note')
    await page.getByLabel(/Email/).fill(email)
    await page.getByTestId('save-button').click()

    await expect(page.getByTestId('save-confirmation')).toBeVisible()
    await expect(page.getByLabel(/Notes/)).toBeDisabled()
    await expect(page.getByLabel(/Email/)).toBeDisabled()
  })
})

test.describe('Lookup — retrieve past results', () => {
  test('navigates to lookup page from header link', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('link', { name: 'Past results' }).click()

    await expect(page).toHaveURL('/lookup')
    await expect(page.getByRole('heading', { name: 'Past results' })).toBeVisible()
  })

  test('unknown email shows not found message', async ({ page }) => {
    await page.goto('/lookup')

    await page.getByLabel('Email address').fill('nobody@nowhere.com')
    await page.getByRole('button', { name: 'Look up' }).click()

    await expect(page.getByTestId('not-found-message')).toBeVisible()
  })

  test('known email retrieves saved result with correct score and breakdown', async ({ page }) => {
    const email = `lookup-${Date.now()}@example.com`

    // Save a result first
    await page.goto('/')
    await answerAllQuestions(page, [3, 3, 3, 3, 3, 3, 3, 3, 3, 3])
    await page.getByTestId('result-score').waitFor()

    await page.getByLabel(/Notes/).fill('Lookup test note')
    await page.getByLabel(/Email/).fill(email)
    await page.getByTestId('save-button').click()
    await page.getByTestId('save-confirmation').waitFor()

    // Now look it up
    await page.goto('/lookup')
    await page.getByLabel('Email address').fill(email)
    await page.getByRole('button', { name: 'Look up' }).click()

    await page.getByTestId('lookup-result-score').waitFor()

    await expect(page.getByTestId('lookup-result-score')).toHaveText('30')
    await expect(page.locator('[data-testid="breakdown-row"]')).toHaveCount(10)
  })

  test('retrieved result shows decrypted notes', async ({ page }) => {
    const email = `notes-${Date.now()}@example.com`
    const noteText = 'My secret cosmic note'

    await page.goto('/')
    await answerAllQuestions(page, [1, 1, 1, 1, 1, 1, 1, 1, 1, 1])
    await page.getByTestId('result-score').waitFor()

    await page.getByLabel(/Notes/).fill(noteText)
    await page.getByLabel(/Email/).fill(email)
    await page.getByTestId('save-button').click()
    await page.getByTestId('save-confirmation').waitFor()

    await page.goto('/lookup')
    await page.getByLabel('Email address').fill(email)
    await page.getByRole('button', { name: 'Look up' }).click()

    await page.getByTestId('lookup-result-score').waitFor()

    // Notes must be decrypted (readable plaintext, not cipher characters)
    await expect(page.getByText(noteText)).toBeVisible()
  })

  test('pressing Enter in lookup input triggers search', async ({ page }) => {
    await page.goto('/lookup')

    await page.getByLabel('Email address').fill('nobody@test.com')
    await page.getByLabel('Email address').press('Enter')

    await expect(page.getByTestId('not-found-message')).toBeVisible()
  })
})
