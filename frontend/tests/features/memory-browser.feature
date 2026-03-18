Feature: Memory Browser
  As a developer debugging my agent
  I want to browse memories stored by my agent
  So that I can understand what my agent has remembered

  Scenario: View list of memories
    Given I am on the Memory Browser page
    When the page loads
    Then I should see a list of memories
