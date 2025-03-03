import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="container mt-5">
      <div className="jumbotron">
        <h1 className="display-4">Welcome to UnEaty!</h1>
        <p className="lead">
          Get your favorite UCLA food truck meals delivered directly to your dorm.
        </p>
        <hr className="my-4" />
        <p>
          Whether you're a student looking for a meal delivery or someone wanting to make
          some extra money delivering food, we've got you covered.
        </p>
        <div className="mt-4">
          <Link to="/register" className="btn btn-primary btn-lg mr-2">
            Get Started
          </Link>
          <Link to="/about" className="btn btn-secondary btn-lg">
            Learn More
          </Link>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h3 className="card-title">For Customers</h3>
              <p className="card-text">
                Browse available deliverers, choose from your favorite food trucks, and
                get food delivered right to your dorm. Pay with your BruinCard.
              </p>
              <Link to="/register" className="btn btn-primary">
                Register as Customer
              </Link>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-body">
              <h3 className="card-title">For Deliverers</h3>
              <p className="card-text">
                Set your availability, choose which food trucks you'll deliver from, and
                earn money by helping fellow students get their favorite meals.
              </p>
              <Link to="/register" className="btn btn-primary">
                Register as Deliverer
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;