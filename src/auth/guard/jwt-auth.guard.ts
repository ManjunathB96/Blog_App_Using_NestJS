import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}



// 🔸 extends — Inheritance from a Class
// A class inherits properties and methods from a base class.

// Allows code reuse.



// 🔹 implements — Contract from an Interface
// A class agrees to follow the structure defined by an interface.

// No method implementations are inherited—just the method signatures.