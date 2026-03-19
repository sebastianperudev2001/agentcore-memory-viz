Feature: List Sessions
  As a developer debugging my agent
  I want to list sessions for a given memory and actor
  So that I can drill into specific conversations

  Scenario: List sessions for an actor
    Given AgentCore has 2 sessions for memory "mem-1" and actor "user-abc"
    When I request sessions for memory "mem-1" and actor "user-abc"
    Then I receive 2 sessions

  Scenario: Return empty list when actor has no sessions
    Given AgentCore has 0 sessions for memory "mem-1" and actor "unknown"
    When I request sessions for memory "mem-1" and actor "unknown"
    Then I receive 0 sessions
