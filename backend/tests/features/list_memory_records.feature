Feature: List Memory Records
  As a developer debugging my agent
  I want to list memory records for a given namespace
  So that I can inspect what semantic knowledge was extracted

  Scenario: List records for the root namespace
    Given AgentCore has 2 memory records for memory "mem-1" in namespace "/"
    When I request memory records for memory "mem-1" in namespace "/"
    Then I receive 2 memory records

  Scenario: Return empty list for an empty namespace
    Given AgentCore has 0 memory records for memory "mem-1" in namespace "/empty"
    When I request memory records for memory "mem-1" in namespace "/empty"
    Then I receive 0 memory records
