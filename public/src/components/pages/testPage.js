import React from 'react';
import { useSearchParams } from 'react-router';


export default function testPage () {
  const [searchParams, setSearchParams] = useSearchParams();
	const id = searchParams.get('id') ?? 'no recibido'

  return (
		<div>
			<div>
				Bienvenido a ICNPAIM:
			</div>
			<div>
				id : {id}
			</div>
		</div>    
  );
}