import "./Footer.css";

function Footer(){
  return(
    <footer className="footer">

      <div className="container">

        <div className="row">

          <div className="col-md-4">
            <h4>SportZone</h4>
            <p>
              Your one stop shop for premium sports equipment.
              Play better. Train harder.
            </p>
          </div>

          <div className="col-md-4">
            <h4>Quick Links</h4>
            <ul>
              <li>Home</li>
              <li>Products</li>
              <li>Cart</li>
              <li>Contact</li>
            </ul>
          </div>

          <div className="col-md-4">
            <h4>Follow Us</h4>
            <p>Instagram</p>
            <p>Facebook</p>
            <p>Twitter</p>
          </div>

        </div>

        <hr/>

        <p className="copyright">
          © 2026 SportZone. All Rights Reserved.
        </p>

      </div>

    </footer>
  )
}

export default Footer