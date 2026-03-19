Feature: Memory Browser
  As a developer debugging my agent
  I want to browse memory resources in my AWS account
  So that I can drill into sessions and inspect conversation history

  Scenario: View list of memory resources on load
    Given I am on the Memory Browser page
    When the page loads
    Then I should see a table of memory resources

  Scenario: Navigate to sessions after clicking a memory resource row
    Given I am on the Memory Browser page
    And the memory resources table shows a resource with id "mem-1"
    When I click on the row for memory "mem-1"
    Then I should be navigated to the sessions page for "mem-1"
