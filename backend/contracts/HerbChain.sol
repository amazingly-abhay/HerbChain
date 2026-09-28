// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract HerbChain {
    enum StepType { Collection, Processing, Testing, Shipment, Retail }

    struct Step {
        StepType stepType;
        uint256 timestamp;
        string actorId;
        string quality;
        string location;
        string action;
        string details;
    }

    struct Product {
        string batchId;
        string herbName;
        uint256 quantity;
        Step[] steps;
    }

    mapping(string => Product) private products;
    
    event StepRecorded(string indexed batchId, StepType indexed stepType, uint256 timestamp);

    function recordCollection(
        string memory _batchId,
        string memory _herbName,
        uint256 _quantity,
        string memory _actorId,
        string memory _quality,
        string memory _location,
        string memory _details
    ) public {
        require(bytes(products[_batchId].batchId).length == 0, "Batch already exists");
        
        Product storage newProduct = products[_batchId];
        newProduct.batchId = _batchId;
        newProduct.herbName = _herbName;
        newProduct.quantity = _quantity;

        Step memory collectionStep = Step({
            stepType: StepType.Collection,
            timestamp: block.timestamp,
            actorId: _actorId,
            quality: _quality,
            location: _location,
            action: "Collected from wild/farm",
            details: _details
        });

        newProduct.steps.push(collectionStep);
        emit StepRecorded(_batchId, StepType.Collection, block.timestamp);
    }

    function recordStep(
        string memory _batchId,
        StepType _stepType,
        string memory _actorId,
        string memory _quality,
        string memory _location,
        string memory _action,
        string memory _details
    ) public {
        require(bytes(products[_batchId].batchId).length != 0, "Batch does not exist");
        require(_stepType != StepType.Collection, "Collection step already recorded");

        Step memory newStep = Step({
            stepType: _stepType,
            timestamp: block.timestamp,
            actorId: _actorId,
            quality: _quality,
            location: _location,
            action: _action,
            details: _details
        });

        products[_batchId].steps.push(newStep);
        emit StepRecorded(_batchId, _stepType, block.timestamp);
    }

    function getProduct(string memory _batchId) public view returns (
        string memory batchId,
        string memory herbName,
        uint256 quantity,
        uint256 stepCount
    ) {
        Product storage p = products[_batchId];
        return (p.batchId, p.herbName, p.quantity, p.steps.length);
    }

    function getSteps(string memory _batchId) public view returns (Step[] memory) {
        return products[_batchId].steps;
    }

    mapping(string => bytes32) public reportHashes;
    event ReportHashStored(string indexed batchId, bytes32 reportHash, uint256 timestamp);

    function storeReportHash(string memory _batchId, bytes32 _hash) public {
        require(reportHashes[_batchId] == bytes32(0), "Report hash already stored for this batch");
        reportHashes[_batchId] = _hash;
        emit ReportHashStored(_batchId, _hash, block.timestamp);
    }

    function verifyReportHash(string memory _batchId, bytes32 _hash) public view returns (bool) {
        return reportHashes[_batchId] == _hash;
    }
}
