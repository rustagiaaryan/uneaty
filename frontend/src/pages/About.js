import React from 'react';

const About = () => {
  return (
    <div className="container mt-4">
      <h2>About UnEaty</h2>
      <p>
        UnEaty is a food delivery service specifically designed for UCLA students.
        Our platform connects students who want food delivered from on-campus food trucks
        to their dorms with fellow students who are willing to make the delivery.
      </p>
      
      <h4 className="mt-4">How It Works</h4>
      <div className="row mt-3">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5>For Customers</h5>
            </div>
            <div className="card-body">
              <ol>
                <li>Create an account as a customer</li>
                <li>Browse available deliverers and their food truck options</li>
                <li>Select items you want to order</li>
                <li>Provide your dorm location details</li>
                <li>Pay using your BruinCard meal swipes</li>
                <li>Receive your food delivery at your dorm</li>
              </ol>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5>For Deliverers</h5>
            </div>
            <div className="card-body">
              <ol>
                <li>Create an account as a deliverer</li>
                <li>Set your availability time slots</li>
                <li>Select which food trucks you'll deliver from</li>
                <li>Set your maximum order capacity</li>
                <li>Accept orders during your available times</li>
                <li>Pick up customer's BruinCard, get their food, and deliver it</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;