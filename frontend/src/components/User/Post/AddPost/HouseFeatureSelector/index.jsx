import React from 'react';
import './index.css';

const HouseFeatureSelector = ({ features = [], selectedFeatures = [], setSelectedFeatures }) => {
    const handleCheckboxChange = (feature) => {
        const updated = selectedFeatures.includes(feature)
            ? selectedFeatures.filter((f) => f !== feature)
            : [...selectedFeatures, feature];

        setSelectedFeatures(updated);
    };

    const firstColumn = features.slice(0, Math.ceil(features.length / 2));
    const secondColumn = features.slice(Math.ceil(features.length / 2));

    return (
        <div className="house-feature-container">
            <label className="add-post-right-header-label">Đặc điểm nhà/đất</label>
            <div className="house-feature-list">
                <div className="house-feature-column">
                    {firstColumn.map((feature, index) => (
                        <label key={index} className="house-feature-item">
                            {feature}
                            <input
                                type="checkbox"
                                checked={selectedFeatures.includes(feature)}
                                onChange={() => handleCheckboxChange(feature)}
                            />
                        </label>
                    ))}
                </div>
                <div className="house-feature-column">
                    {secondColumn.map((feature, index) => (
                        <label key={index + firstColumn.length} className="house-feature-item">
                            {feature}
                            <input
                                type="checkbox"
                                checked={selectedFeatures.includes(feature)}
                                onChange={() => handleCheckboxChange(feature)}
                            />
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HouseFeatureSelector;
