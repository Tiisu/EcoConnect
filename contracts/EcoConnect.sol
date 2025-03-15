// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract EcoConnect {
    // State Variables
    address public admin;
    uint256 public pointPrice;
    uint256 public minimumRewardPoints;
    uint256 public minimumAgentPoints;
    
    // Enums
    enum WasteType { PlasticBags, PlasticBottles, GeneralPlastics }
    enum UserType { Regular, Premium }
    enum AgentStatus { Pending, Approved, Suspended }
    
    // Structs
    struct User {
        bool isRegistered;
        UserType userType;
        uint256 pointBalance;
        uint256 totalWasteReported;
        uint256 rewardsEarned;
        bool isBlacklisted;
    }
    
    struct Agent {
        bool isRegistered;
        AgentStatus status;
        uint256 pointBalance;
        uint256 totalCollections;
        uint256 reputation;
        address walletAddress;
    }
    
    struct WasteReport {
        uint256 id;
        address user;
        WasteType wasteType;
        uint256 weight;
        string[] imageHashes;
        bool isCollected;
        address collectedBy;
        uint256 timestamp;
        bool isVerified;
    }
    
    struct PartnerBusiness {
        string name;
        uint256 discountRate;
        bool isActive;
        uint256 totalRedemptions;
    }

    // Mappings
    mapping(address => User) public users;
    mapping(address => Agent) public agents;
    mapping(uint256 => WasteReport) public wasteReports;
    mapping(uint256 => PartnerBusiness) public partners;
    mapping(WasteType => uint256) public wasteTypePoints;
    
    // Counters
    uint256 private wasteReportCounter;
    uint256 private partnerCounter;
    
    // Events
    event UserRegistered(address indexed user);
    event AgentRegistered(address indexed agent);
    event WasteReported(uint256 indexed reportId, address indexed user, WasteType wasteType, uint256 weight);
    event WasteCollected(uint256 indexed reportId, address indexed agent, address indexed user);
    event PointsAwarded(address indexed user, uint256 points);
    event PointsPurchased(address indexed agent, uint256 points);
    event PointsRedeemed(address indexed user, uint256 indexed partnerId, uint256 points);
    event PartnerAdded(uint256 indexed partnerId, string name);
    event AgentStatusUpdated(address indexed agent, AgentStatus status);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can call this function");
        _;
    }
    
    modifier onlyApprovedAgent() {
        require(agents[msg.sender].isRegistered, "Agent not registered");
        require(agents[msg.sender].status == AgentStatus.Approved, "Agent not approved");
        _;
    }
    
    modifier onlyRegisteredUser() {
        require(users[msg.sender].isRegistered, "User not registered");
        require(!users[msg.sender].isBlacklisted, "User is blacklisted");
        _;
    }

    // Constructor
    constructor(uint256 _pointPrice, uint256 _minimumRewardPoints, uint256 _minimumAgentPoints) {
        admin = msg.sender;
        pointPrice = _pointPrice;
        minimumRewardPoints = _minimumRewardPoints;
        minimumAgentPoints = _minimumAgentPoints;
    }

    // User Functions
    function registerUser() external {
        require(!users[msg.sender].isRegistered, "User already registered");
        
        users[msg.sender] = User({
            isRegistered: true,
            userType: UserType.Regular,
            pointBalance: 0,
            totalWasteReported: 0,
            rewardsEarned: 0,
            isBlacklisted: false
        });
        
        emit UserRegistered(msg.sender);
    }
    
    function reportWaste(
        WasteType _wasteType,
        uint256 _weight,
        string[] memory _imageHashes
    ) external onlyRegisteredUser {
        require(_weight > 0, "Weight must be greater than 0");
        require(_imageHashes.length > 0, "Must provide at least one image");
        
        uint256 reportId = wasteReportCounter++;
        
        wasteReports[reportId] = WasteReport({
            id: reportId,
            user: msg.sender,
            wasteType: _wasteType,
            weight: _weight,
            imageHashes: _imageHashes,
            isCollected: false,
            collectedBy: address(0),
            timestamp: block.timestamp,
            isVerified: false
        });
        
        users[msg.sender].totalWasteReported += _weight;
        
        emit WasteReported(reportId, msg.sender, _wasteType, _weight);
    }
    
    function redeemPoints(uint256 _partnerId, uint256 _points) external onlyRegisteredUser {
        require(partners[_partnerId].isActive, "Partner not active");
        require(users[msg.sender].pointBalance >= _points, "Insufficient points");
        require(_points >= minimumRewardPoints, "Points below minimum requirement");
        
        users[msg.sender].pointBalance -= _points;
        partners[_partnerId].totalRedemptions += 1;
        
        emit PointsRedeemed(msg.sender, _partnerId, _points);
    }

    // Agent Functions
    function registerAgent() external {
        require(!agents[msg.sender].isRegistered, "Agent already registered");
        
        agents[msg.sender] = Agent({
            isRegistered: true,
            status: AgentStatus.Pending,
            pointBalance: 0,
            totalCollections: 0,
            reputation: 100,
            walletAddress: msg.sender
        });
        
        emit AgentRegistered(msg.sender);
    }
    
    function purchasePoints() external payable onlyApprovedAgent {
        require(msg.value >= pointPrice * minimumAgentPoints, "Insufficient payment");
        
        uint256 pointsToAdd = msg.value / pointPrice;
        agents[msg.sender].pointBalance += pointsToAdd;
        
        emit PointsPurchased(msg.sender, pointsToAdd);
    }
    
    function collectWaste(uint256 _reportId) external onlyApprovedAgent {
        WasteReport storage report = wasteReports[_reportId];
        require(!report.isCollected, "Waste already collected");
        require(report.user != address(0), "Invalid report");
        
        uint256 pointsToAward = calculatePoints(report.wasteType, report.weight);
        require(agents[msg.sender].pointBalance >= pointsToAward, "Insufficient agent points");
        
        report.isCollected = true;
        report.collectedBy = msg.sender;
        report.isVerified = true;
        
        agents[msg.sender].pointBalance -= pointsToAward;
        agents[msg.sender].totalCollections += 1;
        users[report.user].pointBalance += pointsToAward;
        
        emit WasteCollected(_reportId, msg.sender, report.user);
        emit PointsAwarded(report.user, pointsToAward);
    }

    // Admin Functions
    function approveAgent(address _agent) external onlyAdmin {
        require(agents[_agent].isRegistered, "Agent not registered");
        require(agents[_agent].status == AgentStatus.Pending, "Agent not pending");
        
        agents[_agent].status = AgentStatus.Approved;
        
        emit AgentStatusUpdated(_agent, AgentStatus.Approved);
    }
    
    function addPartner(string memory _name, uint256 _discountRate) external onlyAdmin {
        uint256 partnerId = partnerCounter++;
        
        partners[partnerId] = PartnerBusiness({
            name: _name,
            discountRate: _discountRate,
            isActive: true,
            totalRedemptions: 0
        });
        
        emit PartnerAdded(partnerId, _name);
    }
    
    function setWasteTypePoints(WasteType _type, uint256 _points) external onlyAdmin {
        wasteTypePoints[_type] = _points;
    }
    
    function updatePointPrice(uint256 _newPrice) external onlyAdmin {
        pointPrice = _newPrice;
    }
    
    function blacklistUser(address _user) external onlyAdmin {
        users[_user].isBlacklisted = true;
    }

    // Helper Functions
    function calculatePoints(WasteType _type, uint256 _weight) internal view returns (uint256) {
        return wasteTypePoints[_type] * _weight;
    }
    
    function getWasteReport(uint256 _reportId) external view returns (WasteReport memory) {
        return wasteReports[_reportId];
    }
    
    function getUserDetails(address _user) external view returns (User memory) {
        return users[_user];
    }
    
    function getAgentDetails(address _agent) external view returns (Agent memory) {
        return agents[_agent];
    }
    
    function getPartnerDetails(uint256 _partnerId) external view returns (PartnerBusiness memory) {
        return partners[_partnerId];
    }
}