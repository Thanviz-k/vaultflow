function Card({

  children,

  title,

  className = "",

}) {

  return (

    <div className={`card ${className}`}>

      {title && (

        <h2>
          {title}
        </h2>

      )}

      {children}

    </div>

  );

}

export default Card;