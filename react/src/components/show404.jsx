/**
 * Fallback-komponent (404-side) som vises når en bruker prøver 
 * å navigere til en nettadresse (URL) i appen som ikke finnes.
 */
export default function Show404() {
    return (
        <div>
            {/* 
              Siden src er "/404.png", forventer React/Vite at dette bildet ligger 
              direkte i "public"-mappen i prosjektet. 
            */}
            <img 
              src="/404.png" 
              alt="404 Not Found" 
              style={{ maxWidth: '100%', margin: '20px 0' }} 
            />
            
            <p>
              Sorry, the page you are looking for does not exist or are currently being built. 
              The builders are a shopping bag and a dog, so this might take some time...
            </p>
        </div>
    )
}