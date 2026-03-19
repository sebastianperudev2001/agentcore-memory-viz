Feature: Session List
  As a developer debugging my agent
  I want to list sessions for a given memory and actor
  So that I can select a session and inspect its event chat history

  Scenario: Load sessions for an actor
    Given I am on the Sessions page for memory "mem-1"
    When I enter actor id "user-abc" and click Load Sessions
    Then I should see a table with sessions for "user-abc"

  Scenario: Navigate to event chat after clicking a session row
    Given I am on the Sessions page for memory "mem-1"
    And the sessions table shows session "sess-1" for actor "user-abc"
    When I click on session "sess-1"
    Then I should be navigated to the event chat page for session "sess-1"
